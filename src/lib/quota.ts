import prisma from '@/lib/db';

const TIER_LIMITS: Record<string, number> = {
  free:       1_000,
  pro:        10_000,
  enterprise: Infinity,
};

export interface QuotaResult {
  allowed: boolean;
  resetsAt: string | null;
  remaining?: number;
  tier?: string;
}

/**
 * Check whether the API key has remaining quota this month.
 * Atomically increments usage if allowed.
 */
export async function enforceQuota(apiKey: string): Promise<QuotaResult> {
  const api = await prisma.api.findUnique({
    where: { apiKey },
    include: { user: true },
  });

  if (!api || !api.isActive) {
    return { allowed: false, resetsAt: null };
  }

  const tier  = api.user.subscriptionTier ?? 'free';
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

  if (!isFinite(limit)) {
    // Enterprise — unlimited, just track
    await prisma.api.update({
      where: { apiKey },
      data:  { callCountTotal: { increment: 1 }, lastAccessed: new Date() },
    });
    return { allowed: true, resetsAt: null, remaining: Infinity, tier };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const usage = await prisma.monthlyUsage.upsert({
    where:  { userId_month: { userId: api.userId, month: monthStart } },
    create: { userId: api.userId, month: monthStart, callsUsed: 0, callsLimit: limit },
    update: {},
  });

  if (usage.callsUsed >= limit) {
    const next = new Date(monthStart);
    next.setMonth(next.getMonth() + 1);
    return { allowed: false, resetsAt: next.toISOString(), tier };
  }

  await prisma.$transaction([
    prisma.monthlyUsage.update({
      where: { userId_month: { userId: api.userId, month: monthStart } },
      data:  { callsUsed: { increment: 1 } },
    }),
    prisma.api.update({
      where: { apiKey },
      data:  {
        callCountTotal: { increment: 1 },
        callCountMonth: { increment: 1 },
        lastAccessed:   new Date(),
      },
    }),
  ]);

  return { allowed: true, resetsAt: null, remaining: limit - usage.callsUsed - 1, tier };
}
