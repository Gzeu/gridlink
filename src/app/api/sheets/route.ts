import { NextRequest } from 'next/server';
import { getSheetData, extractSheetId } from '@/lib/googleSheets';
import { cacheGet, cacheSet } from '@/lib/redis';
import { ok, err } from '@/lib/response';
import { enforceQuota } from '@/lib/quota';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const start        = Date.now();
  const { searchParams } = request.nextUrl;
  const apiKey       = request.headers.get('x-api-key');
  const sheetUrl     = searchParams.get('sheetUrl');
  const sheetId      = sheetUrl
    ? extractSheetId(sheetUrl)
    : searchParams.get('sheetId');
  const tab          = searchParams.get('tab')   ?? undefined;
  const page         = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
  const limit        = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));
  const sortBy       = searchParams.get('sortBy') ?? undefined;
  const order        = searchParams.get('order')  === 'desc' ? 'desc' : 'asc';
  const filter       = searchParams.get('filter') ?? undefined;

  if (!sheetId) return err('Missing sheetId or sheetUrl parameter');
  if (!apiKey)  return err('Missing x-api-key header', 401);

  // Per-IP rate limit: 60 req/min
  const rl = rateLimit(getClientIp(request), { windowMs: 60_000, max: 60 });
  if (!rl.allowed) return err('Too many requests — slow down', 429);

  // Quota enforcement
  const quota = await enforceQuota(apiKey);
  if (!quota.allowed) {
    return err(`Monthly quota exceeded. Resets ${quota.resetsAt}`, 429);
  }

  // Cache
  const cacheKey = `sheet:${sheetId}:${tab ?? 'default'}`;
  let   rows:     (Record<string, string> & { _id: number })[] | null = null;
  let   cacheHit  = false;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    rows     = JSON.parse(cached);
    cacheHit = true;
  } else {
    try {
      rows = await getSheetData(sheetId, 'A1:ZZ1000', tab);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('403') || msg.includes('permission')) {
        return err('Sheet not accessible. Share it with the service account or make it public.', 403);
      }
      return err('Failed to fetch sheet data. Check the sheet ID and permissions.', 502);
    }
    await cacheSet(cacheKey, JSON.stringify(rows), 300);
  }

  // Filter: ?filter=column:value
  if (filter) {
    const colonIdx = filter.indexOf(':');
    if (colonIdx !== -1) {
      const col = filter.slice(0, colonIdx);
      const val = filter.slice(colonIdx + 1).toLowerCase();
      rows = rows!.filter(r => String(r[col] ?? '').toLowerCase().includes(val));
    }
  }

  // Sort
  if (sortBy) {
    rows = [...rows!].sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
      return order === 'asc' ? cmp : -cmp;
    });
  }

  const total   = rows!.length;
  const start_i = (page - 1) * limit;
  const sliced  = rows!.slice(start_i, start_i + limit);

  // Log the call
  const api = await prisma.api.findUnique({ where: { apiKey } });
  if (api) {
    await prisma.apiCall.create({
      data: {
        apiId:         api.id,
        apiKey,
        endpoint:      request.nextUrl.pathname,
        statusCode:    200,
        responseTimeMs: Date.now() - start,
        ipAddress:     getClientIp(request),
        cacheHit,
      },
    });
  }

  return ok({
    rows: sliced,
    pagination: {
      page, limit, total,
      pages:   Math.ceil(total / limit),
      hasNext: start_i + limit < total,
    },
    meta: {
      sheetId,
      tab:       tab ?? 'Sheet1',
      cached:    cacheHit,
      remaining: quota.remaining,
    },
  });
}
