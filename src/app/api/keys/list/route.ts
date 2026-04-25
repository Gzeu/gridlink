import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const clerkId = searchParams.get('clerkId');

  if (!clerkId) return err('Missing clerkId', 400);

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return err('User not found', 404);

  const keys = await prisma.api.findMany({
    where:   { userId: user.id, isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id:             true,
      apiKey:         true,
      apiName:        true,
      sheetId:        true,
      sheetUrl:       true,
      sheetName:      true,
      callCountTotal: true,
      callCountMonth: true,
      lastAccessed:   true,
      createdAt:      true,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gridlink.vercel.app';

  const enriched = keys.map(k => ({
    ...k,
    endpoint: `${baseUrl}/api/sheets?sheetId=${k.sheetId}`,
  }));

  return ok({ keys: enriched, total: keys.length });
}
