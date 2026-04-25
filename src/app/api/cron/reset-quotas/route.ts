import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

const TIER_LIMITS: Record<string, number> = {
  free:       1_000,
  pro:        10_000,
  enterprise: 2_147_483_647, // max int — effectively unlimited in the DB
};

/**
 * POST /api/cron/reset-quotas
 *
 * Resets callCountMonth on all Api rows to 0.
 * Should be called by a Vercel cron job on the 1st of each month.
 * Protected by CRON_SECRET header to prevent public abuse.
 *
 * vercel.json cron config:
 * { "crons": [{ "path": "/api/cron/reset-quotas", "schedule": "0 0 1 * *" }] }
 *
 * Set CRON_SECRET in Vercel env vars and in the cron Authorization header:
 * { "headers": { "Authorization": "Bearer $CRON_SECRET" } }
 */
export async function POST(request: NextRequest) {
  const auth   = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return err('Unauthorized', 401);
  }

  try {
    const now        = new Date();
    const thisMonth  = new Date(now.getFullYear(), now.getMonth(), 1);

    // Reset per-Api monthly counter
    const { count: apisReset } = await prisma.api.updateMany({
      data: { callCountMonth: 0 },
    });

    // Create fresh MonthlyUsage rows for all users for the new month
    const users = await prisma.user.findMany({
      select: { id: true, subscriptionTier: true },
    });

    const upserts = users.map(u =>
      prisma.monthlyUsage.upsert({
        where:  { userId_month: { userId: u.id, month: thisMonth } },
        create: {
          userId:     u.id,
          month:      thisMonth,
          callsUsed:  0,
          callsLimit: TIER_LIMITS[u.subscriptionTier] ?? TIER_LIMITS.free,
        },
        update: { callsUsed: 0 },
      }),
    );

    await prisma.$transaction(upserts);

    return ok({
      message:    `Quotas reset for ${users.length} users, ${apisReset} API keys.`,
      month:      thisMonth.toISOString(),
      usersReset: users.length,
      apisReset,
    });
  } catch (error) {
    console.error('Cron reset-quotas error:', error);
    return err('Failed to reset quotas', 500);
  }
}
