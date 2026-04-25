import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';

const RECEIVER = process.env.EGLD_RECEIVER_ADDRESS ?? '';
const API_URL  = process.env.NEXT_PUBLIC_EGLD_API_URL ?? 'https://api.multiversx.com';

const TIER_PRICING: Record<string, { egld: number; tier: string }> = {
  pro:        { egld: 0.5, tier: 'pro' },
  enterprise: { egld: 2.0, tier: 'enterprise' },
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { txHash, userId, expectedTier } = body as {
    txHash:       string;
    userId:       number;
    expectedTier: string;
  };

  if (!txHash || !userId || !expectedTier) {
    return err('Missing txHash, userId, or expectedTier');
  }
  if (!RECEIVER) {
    return err('Payment receiver not configured', 500);
  }

  const pricing = TIER_PRICING[expectedTier];
  if (!pricing) return err(`Invalid tier "${expectedTier}". Valid: pro, enterprise`);

  // Idempotency — already confirmed?
  const existing = await prisma.egldTransaction.findUnique({ where: { txHash } });
  if (existing?.status === 'confirmed') {
    return err('Transaction already processed', 409);
  }

  // Fetch on-chain
  const provider = new ApiNetworkProvider(API_URL);
  let   tx: Awaited<ReturnType<typeof provider.getTransaction>>;
  try {
    tx = await provider.getTransaction(txHash);
  } catch {
    return err('Transaction not found. Wait for it to appear on-chain and try again.', 404);
  }

  if (tx.status.toString() !== 'success') {
    return err(`Transaction not yet confirmed (status: ${tx.status}). Try again shortly.`, 402);
  }

  if (tx.receiver.toString() !== RECEIVER) {
    return err('Transaction receiver does not match the GridLink payment address.', 400);
  }

  const sentEGLD = Number(tx.value) / 1e18;
  if (sentEGLD < pricing.egld) {
    return err(
      `Insufficient amount. Expected ≥ ${pricing.egld} EGLD, received ${sentEGLD.toFixed(4)} EGLD.`,
      400,
    );
  }

  // Upgrade user
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
    sentEGLD,
    message: `Upgraded to ${pricing.tier}. Your new quota resets on the 1st of next month.`,
    explorerUrl: `https://explorer.multiversx.com/transactions/${txHash}`,
  });
}
