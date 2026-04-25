import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/dashboard/calls?userId=123&limit=20&page=1
 *
 * Returns paginated API call history for a user.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const rawUserId = searchParams.get('userId');
    const userId    = rawUserId ? parseInt(rawUserId, 10) : null;
    const page      = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
    const limit     = Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10));
    const skip      = (page - 1) * limit;

    if (rawUserId && isNaN(userId!)) return err('Invalid userId');

    // Resolve to the user's api keys so calls are scoped correctly
    const keyFilter = userId
      ? {
          apiKey: {
            in: (await prisma.api.findMany({
              where:  { userId, isActive: true },
              select: { apiKey: true },
            })).map(a => a.apiKey),
          },
        }
      : {};

    const [calls, total] = await prisma.$transaction([
      prisma.apiCall.findMany({
        where:   keyFilter,
        orderBy: { timestamp: 'desc' },
        take:    limit,
        skip,
        select: {
          id:            true,
          apiKey:        true,
          endpoint:      true,
          statusCode:    true,
          responseTimeMs: true,
          ipAddress:     true,
          timestamp:     true,
          api: {
            select: { apiName: true, sheetId: true },
          },
        },
      }),
      prisma.apiCall.count({ where: keyFilter }),
    ]);

    return ok({
      calls,
      pagination: {
        page, limit, total,
        pages:   Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Dashboard calls error:', error);
    return err('Failed to fetch call history', 500);
  }
}
