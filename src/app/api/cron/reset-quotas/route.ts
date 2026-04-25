import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

const TIER_LIMITS: Record<string, number> = {
  free:       1_000,
  pro:        10_000,
  enterprise: 999_999_999,
};

function newMonthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return err('Unauthorized', 401);
  }

  const month = newMonthStart();

  // Reset monthly call counter on all API keys
  await prisma.api.updateMany({ data: { callCountMonth: 0 } });

  // Upsert fresh MonthlyUsage rows for all users
  const users = await prisma.user.findMany({
    select: { id: true, subscriptionTier: true },
  });

  await prisma.$transaction(
    users.map(u =>
      prisma.monthlyUsage.upsert({
        where:  { userId_month: { userId: u.id, month } },
        create: {
          userId:     u.id,
          month,
          callsUsed:  0,
          callsLimit: TIER_LIMITS[u.subscriptionTier ?? 'free'] ?? TIER_LIMITS.free,
        },
        update: {
          callsUsed:  0,
          callsLimit: TIER_LIMITS[u.subscriptionTier ?? 'free'] ?? TIER_LIMITS.free,
        },
      }),
    ),
  );

  return ok({ reset: true, users: users.length, month: month.toISOString() });
}
