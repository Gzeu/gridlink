import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import { extractSheetId, validateSheetAccess } from '@/lib/googleSheets';
import prisma from '@/lib/db';
import { randomBytes } from 'crypto';

function generateApiKey(): string {
  return `gl_${randomBytes(24).toString('base64url')}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { userId, sheetUrl, sheetName, apiName } = body as {
    userId:    number;
    sheetUrl:  string;
    sheetName?: string;
    apiName?:  string;
  };

  if (!userId || !sheetUrl) return err('Missing userId or sheetUrl');

  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) return err('Invalid Google Sheets URL or ID');

  const accessible = await validateSheetAccess(sheetId);
  if (!accessible) {
    return err(
      'Sheet not accessible. Share it with the service account email from your settings.',
      403,
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return err('User not found', 404);

  if (user.subscriptionTier === 'free') {
    const count = await prisma.api.count({ where: { userId, isActive: true } });
    if (count >= 3) {
      return err('Free tier allows up to 3 APIs. Upgrade to Pro for unlimited.', 403);
    }
  }

  const api = await prisma.api.create({
    data: {
      apiKey:    generateApiKey(),
      userId,
      sheetId,
      sheetUrl,
      sheetName: sheetName ?? 'Sheet1',
      apiName:   apiName ?? `API ${sheetId.slice(0, 8)}`,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gridlink.vercel.app';

  return ok(
    {
      apiKey:    api.apiKey,
      endpoint:  `${baseUrl}/api/sheets?sheetId=${sheetId}`,
      sheetId,
      apiName:   api.apiName,
      createdAt: api.createdAt,
      examples: {
        curl:       `curl -H "x-api-key: ${api.apiKey}" "${baseUrl}/api/sheets?sheetId=${sheetId}&limit=10"`,
        javascript: `fetch('${baseUrl}/api/sheets?sheetId=${sheetId}', { headers: { 'x-api-key': '${api.apiKey}' } })`,
        python:     `requests.get('${baseUrl}/api/sheets', params={'sheetId': '${sheetId}'}, headers={'x-api-key': '${api.apiKey}'})`,
      },
    },
    201,
  );
}

export async function DELETE(request: NextRequest) {
  const apiKey = request.nextUrl.searchParams.get('apiKey');
  if (!apiKey) return err('Missing apiKey query parameter');

  const api = await prisma.api.findUnique({ where: { apiKey } });
  if (!api) return err('API key not found', 404);

  await prisma.api.update({
    where: { apiKey },
    data:  { isActive: false },
  });

  return ok({ revoked: true, apiKey, apiName: api.apiName });
}
