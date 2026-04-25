import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

// Called from Clerk webhook or client after sign-in to ensure user exists in DB
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { clerkId, email, name } = body as {
    clerkId: string;
    email:   string;
    name?:   string;
  };

  if (!clerkId || !email) return err('Missing clerkId or email');

  const user = await prisma.user.upsert({
    where:  { clerkId },
    create: { clerkId, email, name: name ?? null, subscriptionTier: 'free' },
    update: { email, name: name ?? undefined },
  });

  return ok({
    id:               user.id,
    clerkId:          user.clerkId,
    email:            user.email,
    subscriptionTier: user.subscriptionTier,
    isNew:            user.createdAt.getTime() === user.updatedAt.getTime(),
  });
}
