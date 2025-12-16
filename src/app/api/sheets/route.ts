import { NextRequest, NextResponse } from 'next/server';
import { getSheetData, appendRow } from '@/lib/googleSheets';
import { cacheGet, cacheSet } from '@/lib/redis';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sheetUrl = request.nextUrl.searchParams.get('sheetUrl');
    const sheetId = request.nextUrl.searchParams.get('sheetId');

    if (!sheetUrl && !sheetId) {
      return NextResponse.json(
        { error: 'Missing sheetUrl or sheetId' },
        { status: 400 },
      );
    }

    const cacheKey = `sheet:${sheetUrl || sheetId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const data = await getSheetData(sheetUrl || sheetId);
    await cacheSet(cacheKey, data, 3600); // Cache for 1 hour

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/sheets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sheet data' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetUrl, sheetId, values, userId, egldAddress } = body;

    if (!values || !Array.isArray(values)) {
      return NextResponse.json(
        { error: 'Invalid values format' },
        { status: 400 },
      );
    }

    // Store request in database with EGLD address for audit
    await prisma.apiRequest.create({
      data: {
        sheetId: sheetId || sheetUrl,
        method: 'POST',
        userId,
        egldAddress,
        status: 'pending',
      },
    });

    const result = await appendRow(sheetUrl || sheetId, values);
    const cacheKey = `sheet:${sheetUrl || sheetId}`;
    await cacheSet(cacheKey, null, 0); // Invalidate cache

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/sheets error:', error);
    return NextResponse.json(
      { error: 'Failed to append data' },
      { status: 500 },
    );
  }
}
