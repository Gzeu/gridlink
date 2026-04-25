import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

const TIER_LIMITS: Record<string, number> = {
  free:       1_000,
  pro:        10_000,
  enterprise: Infinity,
};

function monthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: NextRequest) {
  const clerkId = request.nextUrl.searchParams.get('clerkId');
  if (!clerkId) return err('Missing clerkId parameter', 400);

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return err('User not found', 404);

  const month = monthStart();

  const [totalCalls, callsThisMonth, cacheHits, avgResp, usage, activeApis] =
    await prisma.$transaction([
      prisma.apiCall.count({ where: { api: { userId: user.id } } }),
      prisma.apiCall.count({
        where: { api: { userId: user.id }, timestamp: { gte: month } },
      }),
      prisma.apiCall.count({
        where: { api: { userId: user.id }, cacheHit: true },
      }),
      prisma.apiCall.aggregate({
        where: { api: { userId: user.id } },
        _avg:  { responseTimeMs: true },
      }),
      prisma.monthlyUsage.findUnique({
        where: { userId_month: { userId: user.id, month } },
      }),
      prisma.api.count({ where: { userId: user.id, isActive: true } }),
    ]);

  const tier       = user.subscriptionTier ?? 'free';
  const limit      = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
  const callsUsed  = usage?.callsUsed ?? 0;
  const remaining  = limit === Infinity ? Infinity : Math.max(0, limit - callsUsed);
  const successCalls = await prisma.apiCall.count({
    where: { api: { userId: user.id }, statusCode: { gte: 200, lt: 400 } },
  });

  return ok({
    totalCalls,
    callsThisMonth,
    cacheHits,
    cacheHitRate:    totalCalls > 0 ? Math.round((cacheHits / totalCalls) * 100) : 0,
    avgResponseTime: Math.round(avgResp._avg.responseTimeMs ?? 0),
    successRate:     totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 100,
    remainingCalls:  remaining,
    callsLimit:      limit,
    tier,
    activeApis,
  });
}
