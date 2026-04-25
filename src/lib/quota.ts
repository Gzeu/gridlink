import prisma from '@/lib/db';

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

export async function enforceQuota(
  apiKey: string,
): Promise<{ allowed: boolean; resetsAt: string | null; remaining?: number }> {
  const api = await prisma.api.findUnique({
    where: { apiKey },
    include: { user: true },
  });

  if (!api || !api.isActive) {
    return { allowed: false, resetsAt: null };
  }

  const tier  = api.user.subscriptionTier ?? 'free';
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

  if (limit === Infinity) {
    await prisma.api.update({
      where: { apiKey },
      data:  { callCountTotal: { increment: 1 }, callCountMonth: { increment: 1 }, lastAccessed: new Date() },
    });
    return { allowed: true, resetsAt: null, remaining: Infinity };
  }

  const month = monthStart();

  const usage = await prisma.monthlyUsage.upsert({
    where:  { userId_month: { userId: api.userId, month } },
    create: { userId: api.userId, month, callsUsed: 0, callsLimit: limit },
    update: {},
  });

  if (usage.callsUsed >= limit) {
    const next = new Date(month);
    next.setMonth(next.getMonth() + 1);
    return { allowed: false, resetsAt: next.toISOString() };
  }

  await prisma.$transaction([
    prisma.monthlyUsage.update({
      where: { userId_month: { userId: api.userId, month } },
      data:  { callsUsed: { increment: 1 } },
    }),
    prisma.api.update({
      where: { apiKey },
      data:  { callCountTotal: { increment: 1 }, callCountMonth: { increment: 1 }, lastAccessed: new Date() },
    }),
  ]);

  return { allowed: true, resetsAt: null, remaining: limit - usage.callsUsed - 1 };
}
