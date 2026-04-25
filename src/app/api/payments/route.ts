import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const clerkId = searchParams.get('clerkId');
  const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));

  if (!clerkId) return err('Missing clerkId', 400);

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return err('User not found', 404);

  const skip  = (page - 1) * limit;
  const where = { userId: user.id };

  const [transactions, total] = await prisma.$transaction([
    prisma.egldTransaction.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:           true,
        txHash:       true,
        amountEgld:   true,
        creditsAdded: true,
        status:       true,
        confirmedAt:  true,
        createdAt:    true,
      },
    }),
    prisma.egldTransaction.count({ where }),
  ]);

  return ok({
    transactions,
    pagination: {
      page, limit, total,
      pages:   Math.ceil(total / limit),
      hasNext: skip + limit < total,
    },
  });
}

export async function POST(request: NextRequest) {
  // Initiate a payment intent — returns the receiver address and expected amounts
  const body = await request.json().catch(() => null);
  if (!body?.tier) return err('Missing tier');

  const TIER_PRICING: Record<string, { egld: number; description: string }> = {
    pro:        { egld: 0.5,  description: 'Pro — 10,000 calls/month' },
    enterprise: { egld: 2.0,  description: 'Enterprise — Unlimited calls/month' },
  };

  const pricing = TIER_PRICING[body.tier];
  if (!pricing) return err(`Invalid tier. Valid: ${Object.keys(TIER_PRICING).join(', ')}`);

  return ok({
    receiver:    process.env.EGLD_RECEIVER_ADDRESS,
    amountEgld:  pricing.egld,
    description: pricing.description,
    memo:        `gridlink-${body.tier}-upgrade`,
    instructions: [
      `Send exactly ${pricing.egld} EGLD to the receiver address`,
      'Use xPortal or MultiversX Web Wallet',
      'Copy the transaction hash after sending',
      'Call POST /api/payments/verify with { txHash, userId, expectedTier }',
    ],
  });
}
