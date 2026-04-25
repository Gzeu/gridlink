import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const clerkId = searchParams.get('clerkId');
  const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));

  if (!clerkId) return err('Missing clerkId parameter', 400);

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return err('User not found', 404);

  const skip  = (page - 1) * limit;
  const where = { api: { userId: user.id } };

  const [calls, total] = await prisma.$transaction([
    prisma.apiCall.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { timestamp: 'desc' },
      select: {
        id:            true,
        apiKey:        true,
        endpoint:      true,
        statusCode:    true,
        responseTimeMs: true,
        cacheHit:      true,
        ipAddress:     true,
        timestamp:     true,
        api: {
          select: { apiName: true, sheetId: true },
        },
      },
    }),
    prisma.apiCall.count({ where }),
  ]);

  return ok({
    calls,
    pagination: {
      page, limit, total,
      pages:   Math.ceil(total / limit),
      hasNext: skip + limit < total,
    },
  });
}
