import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Fetch recent API calls
    const apiCalls = await prisma.apiCall.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        sheetId: true,
        method: true,
        endpoint: true,
        status: true,
        cachedFromRedis: true,
        egldAddress: true,
        createdAt: true,
      },
    });
    
    // Get total count for pagination
    const totalCount = await prisma.apiCall.count();
    
    return NextResponse.json({
      calls: apiCalls,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Dashboard calls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API calls' },
      { status: 500 }
    );
  }
}
