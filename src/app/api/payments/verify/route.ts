import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import { egldProvider } from '@/lib/multiversx';
import prisma from '@/lib/db';

const RECEIVER = process.env.EGLD_RECEIVER_ADDRESS ?? '';

/**
 * Pricing table — EGLD amounts required per tier upgrade.
 * Update these values when EGLD price changes significantly.
 */
const TIER_PRICING: Record<string, { egld: number; tier: string }> = {
  pro:        { egld: 0.5,  tier: 'pro' },
  enterprise: { egld: 2.0,  tier: 'enterprise' },
};

/**
 * POST /api/payments/verify
 *
 * Body: { txHash: string, userId: number, expectedTier: 'pro' | 'enterprise' }
 *
 * Verifies the on-chain transaction:
 *   1. Checks tx status is 'success'
 *   2. Checks receiver matches EGLD_RECEIVER_ADDRESS
 *   3. Checks sent amount >= tier price
 *   4. Upgrades user tier + records transaction (idempotent via txHash unique)
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { txHash, userId, expectedTier } = body as {
    txHash: string;
    userId: number;
    expectedTier: string;
  };

  if (!txHash || !userId || !expectedTier) {
    return err('Missing required fields: txHash, userId, expectedTier');
  }

  const pricing = TIER_PRICING[expectedTier];
  if (!pricing) return err(`Invalid tier "${expectedTier}". Valid values: pro, enterprise`);

  if (!RECEIVER) {
    return err('Server misconfiguration: EGLD_RECEIVER_ADDRESS is not set', 500);
  }

  // Idempotency — skip if already processed
  const existing = await prisma.egldTransaction.findUnique({ where: { txHash } });
  if (existing?.status === 'confirmed') {
    return ok({
      alreadyProcessed: true,
      tier:  pricing.tier,
      txHash,
      message: 'Transaction was already applied to your account.',
    });
  }

  // Fetch transaction from MultiversX
  let tx: Awaited<ReturnType<typeof egldProvider.getTransaction>>;
  try {
    tx = await egldProvider.getTransaction(txHash);
  } catch {
    return err('Transaction not found on chain. It may still be processing — try again in 10 seconds.', 404);
  }

  if (tx.status.toString() !== 'success') {
    return err(
      `Transaction is not yet successful (status: ${tx.status}). Wait for it to be finalized.`,
      402,
    );
  }

  if (tx.receiver.toString() !== RECEIVER) {
    return err(
      `Transaction receiver mismatch. Expected ${RECEIVER}, got ${tx.receiver}.`,
      400,
    );
  }

  const sentEGLD = Number(tx.value) / 1e18;
  if (sentEGLD < pricing.egld) {
    return err(
      `Insufficient payment. Expected ${pricing.egld} EGLD for ${pricing.tier}, received ${sentEGLD.toFixed(4)} EGLD.`,
      400,
    );
  }

  // All checks passed — write atomically
  await prisma.$transaction([
    prisma.egldTransaction.upsert({
      where:  { txHash },
      create: {
        userId,
        txHash,
        amountEgld:   sentEGLD,
        creditsAdded: sentEGLD,
        status:       'confirmed',
        confirmedAt:  new Date(),
      },
      update: { status: 'confirmed', confirmedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data:  { subscriptionTier: pricing.tier, subscriptionStatus: 'active' },
    }),
  ]);

  return ok({
    tier:    pricing.tier,
    txHash,
    paidEGLD: sentEGLD,
    message: `Upgraded to ${pricing.tier}. Your new quota is active immediately and resets on the 1st of next month.`,
  });
}
