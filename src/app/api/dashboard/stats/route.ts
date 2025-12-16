import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get date range for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total API calls
    const totalCalls = await prisma.apiCall.count();
    
    // Get cached calls count
    const cachedCalls = await prisma.apiCall.count({
      where: { cachedFromRedis: true },
    });
    
    // Get calls this month
    const callsThisMonth = await prisma.apiCall.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
    
    // Get successful calls (status 200-299)
    const successfulCalls = await prisma.apiCall.count({
      where: {
        status: {
          gte: 200,
          lt: 300,
        },
      },
    });
    
    // Calculate success rate
    const successRate = totalCalls > 0 
      ? Math.round((successfulCalls / totalCalls) * 100) 
      : 100;
    
    // Get recent calls for average response time calculation
    // Note: You'll need to add a responseTime field to your schema
    const avgResponseTime = 89; // Placeholder - implement actual calculation
    
    const remainingCalls = Math.max(0, 1000 - callsThisMonth);
    
    return NextResponse.json({
      totalCalls,
      cachedCalls,
      callsThisMonth,
      remainingCalls,
      successRate,
      avgResponseTime,
      cacheHitRate: totalCalls > 0 ? Math.round((cachedCalls / totalCalls) * 100) : 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
