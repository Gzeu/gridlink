import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';
import { randomBytes } from 'crypto';
import { extractSheetId, validateSheetAccess } from '@/lib/googleSheets';

export const runtime = 'nodejs';

const FREE_TIER_API_LIMIT = 3;

function generateApiKey(): string {
  return `gl_${randomBytes(24).toString('base64url')}`;
}

/**
 * POST /api/keys
 * Create a new API key linked to a Google Sheet.
 * Body: { userId, sheetUrl, sheetName?, apiName? }
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { userId, sheetUrl, sheetName, apiName } = body as {
    userId:    number;
    sheetUrl:  string;
    sheetName?: string;
    apiName?:   string;
  };

  if (!userId)   return err('Missing userId');
  if (!sheetUrl) return err('Missing sheetUrl');

  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) return err('Invalid Google Sheets URL');

  const accessible = await validateSheetAccess(sheetId);
  if (!accessible) {
    return err(
      'Sheet is not accessible. Make sure it is shared with the GridLink service account.',
      403,
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return err('User not found', 404);

  // Free tier: cap at 3 active APIs
  if (user.subscriptionTier === 'free') {
    const count = await prisma.api.count({ where: { userId, isActive: true } });
    if (count >= FREE_TIER_API_LIMIT) {
      return err(
        `Free tier allows up to ${FREE_TIER_API_LIMIT} active APIs. Upgrade to Pro for unlimited.`,
        403,
      );
    }
  }

  const api = await prisma.api.create({
    data: {
      apiKey:    generateApiKey(),
      userId,
      sheetId,
      sheetUrl,
      sheetName: sheetName ?? 'Sheet1',
      apiName:   apiName ?? `Sheet API (${sheetId.slice(0, 8)})`,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gridlink.vercel.app';

  return ok(
    {
      apiKey:    api.apiKey,
      endpoint:  `${baseUrl}/api/sheets?sheetId=${sheetId}`,
      sheetId,
      sheetName: api.sheetName,
      apiName:   api.apiName,
      createdAt: api.createdAt,
      usage: {
        curl:       `curl -H "x-api-key: ${api.apiKey}" "${baseUrl}/api/sheets?sheetId=${sheetId}"`,
        javascript: `fetch('${baseUrl}/api/sheets?sheetId=${sheetId}', { headers: { 'x-api-key': '${api.apiKey}' } }).then(r => r.json())`,
        python:     `requests.get('${baseUrl}/api/sheets', params={'sheetId': '${sheetId}'}, headers={'x-api-key': '${api.apiKey}'})`,
      },
    },
    201,
  );
}

/**
 * DELETE /api/keys?apiKey=gl_...
 * Revoke (soft-delete) an API key.
 */
export async function DELETE(request: NextRequest) {
  const apiKey = request.nextUrl.searchParams.get('apiKey');
  if (!apiKey) return err('Missing apiKey query parameter');

  const api = await prisma.api.findUnique({ where: { apiKey } });
  if (!api)           return err('API key not found', 404);
  if (!api.isActive)  return err('API key is already revoked', 409);

  await prisma.api.update({
    where: { apiKey },
    data:  { isActive: false },
  });

  return ok({ revoked: true, apiKey });
}

/**
 * GET /api/keys?userId=123
 * List all active API keys for a user.
 */
export async function GET(request: NextRequest) {
  const userId = parseInt(request.nextUrl.searchParams.get('userId') ?? '', 10);
  if (isNaN(userId)) return err('Missing or invalid userId');

  const apis = await prisma.api.findMany({
    where:   { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      apiKey:        true,
      apiName:       true,
      sheetId:       true,
      sheetUrl:      true,
      sheetName:     true,
      callCountTotal: true,
      callCountMonth: true,
      lastAccessed:  true,
      createdAt:     true,
    },
  });

  return ok({ apis });
}
