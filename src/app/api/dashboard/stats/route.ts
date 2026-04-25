import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/dashboard/stats?userId=123
 *
 * Returns API usage stats for a specific user.
 * Falls back to global stats when userId is omitted (admin use).
 */
export async function GET(request: NextRequest) {
  try {
    const rawUserId = request.nextUrl.searchParams.get('userId');
    const userId    = rawUserId ? parseInt(rawUserId, 10) : null;

    if (rawUserId && isNaN(userId!)) return err('Invalid userId');

    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build where clause scoped to user's API keys when userId is provided
    const userApiKeys = userId
      ? (await prisma.api.findMany({
          where:  { userId, isActive: true },
          select: { apiKey: true },
        })).map(a => a.apiKey)
      : null;

    const callWhere = userApiKeys
      ? { apiKey: { in: userApiKeys } }
      : {};

    const [totalCalls, callsThisMonth, successfulCalls, avgAgg] =
      await prisma.$transaction([
        prisma.apiCall.count({ where: callWhere }),
        prisma.apiCall.count({
          where: { ...callWhere, timestamp: { gte: startOfMonth } },
        }),
        prisma.apiCall.count({
          where: { ...callWhere, statusCode: { gte: 200, lt: 300 } },
        }),
        prisma.apiCall.aggregate({
          where:   callWhere,
          _avg:    { responseTimeMs: true },
        }),
      ]);

    // Quota info for the user
    let quota: { callsUsed: number; callsLimit: number } | null = null;
    if (userId) {
      quota = await prisma.monthlyUsage.findUnique({
        where:  { userId_month: { userId, month: startOfMonth } },
        select: { callsUsed: true, callsLimit: true },
      });
    }

    const successRate    = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 100;
    const avgResponseMs  = Math.round(avgAgg._avg.responseTimeMs ?? 0);
    const callsLimit     = quota?.callsLimit ?? 1_000;
    const callsUsed      = quota?.callsUsed  ?? callsThisMonth;
    const remainingCalls = Math.max(0, callsLimit - callsUsed);

    return ok({
      totalCalls,
      callsThisMonth: callsUsed,
      remainingCalls,
      callsLimit,
      successRate,
      avgResponseTimeMs: avgResponseMs,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return err('Failed to fetch dashboard stats', 500);
  }
}
