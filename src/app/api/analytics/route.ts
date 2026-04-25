import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

function rangeStart(range: string): Date {
  const d = new Date();
  if (range === '30d') d.setDate(d.getDate() - 30);
  else if (range === '90d') d.setDate(d.getDate() - 90);
  else d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const clerkId = searchParams.get('clerkId');
  const range   = searchParams.get('range') ?? '7d';

  if (!clerkId) return err('Missing clerkId', 400);

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return err('User not found', 404);

  const since = rangeStart(range);

  // All calls in range for this user
  const allCalls = await prisma.apiCall.findMany({
    where: { api: { userId: user.id }, timestamp: { gte: since } },
    select: { timestamp: true, statusCode: true, cacheHit: true, responseTimeMs: true },
    orderBy: { timestamp: 'asc' },
  });

  // Group by day
  const byDay = new Map<string, { calls: number; cached: number; errors: number; totalMs: number }>();
  for (const call of allCalls) {
    const day = call.timestamp.toISOString().slice(0, 10);
    const existing = byDay.get(day) ?? { calls: 0, cached: 0, errors: 0, totalMs: 0 };
    existing.calls++;
    if (call.cacheHit)                       existing.cached++;
    if (call.statusCode >= 400)              existing.errors++;
    if (call.responseTimeMs)                 existing.totalMs += call.responseTimeMs;
    byDay.set(day, existing);
  }

  const usageData = Array.from(byDay.entries()).map(([date, v]) => ({
    date:    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calls:   v.calls,
    cached:  v.cached,
    errors:  v.errors,
    avgMs:   v.calls > 0 ? Math.round(v.totalMs / v.calls) : 0,
  }));

  // Status code distribution
  const statusMap = new Map<number, number>();
  for (const c of allCalls) {
    statusMap.set(c.statusCode, (statusMap.get(c.statusCode) ?? 0) + 1);
  }
  const statusData = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status: String(status), count }))
    .sort((a, b) => parseInt(a.status) - parseInt(b.status));

  // Top sheets by call count
  const topSheets = await prisma.apiCall.groupBy({
    by:       ['apiId'],
    where:    { api: { userId: user.id }, timestamp: { gte: since } },
    _count:   { id: true },
    orderBy:  { _count: { id: 'desc' } },
    take:     5,
  });

  const topSheetsWithName = await Promise.all(
    topSheets.map(async (s) => {
      const api = await prisma.api.findUnique({ where: { id: s.apiId }, select: { apiName: true, sheetId: true } });
      return { apiName: api?.apiName ?? 'Unknown', sheetId: api?.sheetId ?? '', calls: s._count.id };
    }),
  );

  // Summary
  const total        = allCalls.length;
  const cached       = allCalls.filter(c => c.cacheHit).length;
  const errors       = allCalls.filter(c => c.statusCode >= 400).length;
  const totalMs      = allCalls.reduce((s, c) => s + (c.responseTimeMs ?? 0), 0);
  const avgResponse  = total > 0 ? Math.round(totalMs / total) : 0;

  // Peak hour
  const hourMap = new Map<number, number>();
  for (const c of allCalls) {
    const h = c.timestamp.getHours();
    hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  }
  let peakHour = 0, peakCount = 0;
  for (const [h, n] of hourMap) {
    if (n > peakCount) { peakCount = n; peakHour = h; }
  }
  const peakLabel = peakCount > 0
    ? `${peakHour.toString().padStart(2,'0')}:00`
    : 'N/A';

  return ok({
    usageData,
    statusData,
    topSheets: topSheetsWithName,
    summary: {
      total,
      cached,
      cacheHitRate:  total > 0 ? Math.round((cached / total) * 100) : 0,
      errors,
      errorRate:     total > 0 ? parseFloat(((errors / total) * 100).toFixed(1)) : 0,
      successRate:   total > 0 ? parseFloat((((total - errors) / total) * 100).toFixed(1)) : 100,
      avgResponseMs: avgResponse,
      avgDailyCalls: usageData.length > 0 ? Math.round(total / usageData.length) : 0,
      peakHour:      peakLabel,
      range,
    },
  });
}
