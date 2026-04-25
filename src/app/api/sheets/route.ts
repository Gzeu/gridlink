import { NextRequest } from 'next/server';
import { getSheetData, extractSheetId } from '@/lib/googleSheets';
import { cacheGet, cacheSet } from '@/lib/redis';
import { ok, err } from '@/lib/response';
import { enforceQuota } from '@/lib/quota';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const apiKey   = request.headers.get('x-api-key');
  const sheetUrl = searchParams.get('sheetUrl');
  const sheetId  = sheetUrl
    ? extractSheetId(sheetUrl)
    : searchParams.get('sheetId');
  const tab      = searchParams.get('tab') ?? undefined;
  const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit    = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));
  const sortBy   = searchParams.get('sortBy') ?? undefined;
  const order    = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  // Filter format: ?filter=ColumnName:value  (case-insensitive substring match)
  const filter   = searchParams.get('filter') ?? undefined;

  if (!sheetId)  return err('Missing sheetId or sheetUrl');
  if (!apiKey)   return err('Missing x-api-key header', 401);

  // ── Quota enforcement ───────────────────────────────────────────────────────
  const quota = await enforceQuota(apiKey);
  if (!quota.allowed) {
    return err(
      `Monthly quota exceeded (tier: ${quota.tier}). Resets at ${quota.resetsAt}. Upgrade at gridlink.vercel.app/upgrade`,
      429,
    );
  }

  // ── Cache ────────────────────────────────────────────────────────────────────
  const cacheKey = `sheet:${sheetId}:${tab ?? 'default'}`;
  let rows: Array<Record<string, string> & { _id: number }> | null = null;
  let fromCache = false;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    rows      = typeof cached === 'string' ? JSON.parse(cached) : cached as any;
    fromCache = true;
  } else {
    try {
      rows = await getSheetData(sheetId, 'A1:ZZ1000', tab);
    } catch (e) {
      console.error('Google Sheets fetch error:', e);
      return err('Failed to fetch sheet data. Check that the sheet is shared with the service account.', 502);
    }
    await cacheSet(cacheKey, JSON.stringify(rows), 300); // 5-minute TTL
  }

  // ── Filter ───────────────────────────────────────────────────────────────────
  if (filter) {
    const colonIdx = filter.indexOf(':');
    if (colonIdx > 0) {
      const col = filter.slice(0, colonIdx);
      const val = filter.slice(colonIdx + 1).toLowerCase();
      rows = rows!.filter(r =>
        String(r[col] ?? '').toLowerCase().includes(val),
      );
    }
  }

  // ── Sort ─────────────────────────────────────────────────────────────────────
  if (sortBy) {
    rows = [...rows!].sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return order === 'asc' ? cmp : -cmp;
    });
  }

  // ── Paginate ─────────────────────────────────────────────────────────────────
  const total  = rows!.length;
  const start  = (page - 1) * limit;
  const sliced = rows!.slice(start, start + limit);

  return ok({
    rows: sliced,
    pagination: {
      page,
      limit,
      total,
      pages:   Math.ceil(total / limit),
      hasNext: start + limit < total,
    },
    meta: {
      sheetId,
      tab:            tab ?? 'Sheet1',
      cached:         fromCache,
      quotaRemaining: quota.remaining,
      tier:           quota.tier,
    },
  });
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return err('Missing x-api-key header', 401);

  const quota = await enforceQuota(apiKey);
  if (!quota.allowed) return err('Monthly quota exceeded', 429);

  try {
    const body = await request.json();
    const { sheetUrl, sheetId: rawId, values, tab } = body;

    const sheetId = rawId ?? extractSheetId(sheetUrl ?? '');
    if (!sheetId)                         return err('Missing sheetId or sheetUrl');
    if (!values || !Array.isArray(values)) return err('values must be a non-empty array');

    const { appendRow }  = await import('@/lib/googleSheets');
    const { cacheSet: delCache } = await import('@/lib/redis');
    const result = await appendRow(sheetId, values, tab ?? 'Sheet1');

    // Bust the read cache for this sheet
    await delCache(`sheet:${sheetId}:${tab ?? 'default'}`, 0);

    return ok(result, 201);
  } catch (e) {
    console.error('POST /api/sheets error:', e);
    return err('Failed to append data', 500);
  }
}
