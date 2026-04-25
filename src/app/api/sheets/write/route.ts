import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import { appendRow, updateRow, extractSheetId } from '@/lib/googleSheets';
import { cacheGet, cacheSet } from '@/lib/redis';
import { enforceQuota } from '@/lib/quota';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

// POST — append a new row
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return err('Missing x-api-key header', 401);

  const quota = await enforceQuota(apiKey);
  if (!quota.allowed) return err(`Quota exceeded. Resets ${quota.resetsAt}`, 429);

  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { sheetId: rawId, sheetUrl, tab, values } = body as {
    sheetId?:  string;
    sheetUrl?: string;
    tab?:      string;
    values:    Record<string, string>;
  };

  if (!values || typeof values !== 'object') {
    return err('Missing values object. Example: { "Name": "Alice", "Score": "95" }');
  }

  const sheetId = rawId ?? (sheetUrl ? extractSheetId(sheetUrl) : null);
  if (!sheetId) return err('Missing sheetId or sheetUrl');

  // Verify the API key owns an API for this sheet
  const api = await prisma.api.findFirst({ where: { apiKey, sheetId, isActive: true } });
  if (!api) return err('This API key is not authorized for this sheet', 403);

  const rowValues = Object.values(values);
  await appendRow(sheetId, rowValues, tab ?? api.sheetName);

  // Invalidate cache
  await cacheSet(`sheet:${sheetId}:${tab ?? api.sheetName}`, '', 0);

  return ok({ appended: true, sheetId, values }, 201);
}

// PUT — update a row by _id (row number)
export async function PUT(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return err('Missing x-api-key header', 401);

  const quota = await enforceQuota(apiKey);
  if (!quota.allowed) return err(`Quota exceeded. Resets ${quota.resetsAt}`, 429);

  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const { sheetId: rawId, sheetUrl, tab, rowNumber, values } = body as {
    sheetId?:   string;
    sheetUrl?:  string;
    tab?:       string;
    rowNumber:  number;
    values:     Record<string, string>;
  };

  if (!rowNumber || rowNumber < 2) return err('rowNumber must be >= 2 (row 1 is the header)');
  if (!values || typeof values !== 'object') return err('Missing values object');

  const sheetId = rawId ?? (sheetUrl ? extractSheetId(sheetUrl) : null);
  if (!sheetId) return err('Missing sheetId or sheetUrl');

  const api = await prisma.api.findFirst({ where: { apiKey, sheetId, isActive: true } });
  if (!api) return err('This API key is not authorized for this sheet', 403);

  await updateRow(sheetId, rowNumber, values, tab ?? api.sheetName);

  // Invalidate cache
  await cacheSet(`sheet:${sheetId}:${tab ?? api.sheetName}`, '', 0);

  return ok({ updated: true, sheetId, rowNumber, values });
}

// DELETE is not supported on Sheets API without batchUpdate — return a clear explanation
export async function DELETE() {
  return err(
    'Row deletion via API is not supported — Google Sheets API does not expose a simple delete-row endpoint. ' +
    'Use PUT to clear a row, or manage deletions directly in the sheet.',
    501,
  );
}
