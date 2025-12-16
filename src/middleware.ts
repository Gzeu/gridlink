import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (in production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const rateLimitData = rateLimitMap.get(ip);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return null;
  }
  
  if (rateLimitData.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }
  
  rateLimitData.count++;
  return null;
}

export default authMiddleware({
  publicRoutes: ['/'],
  ignoredRoutes: ['/api/health'],
  beforeAuth: (request) => {
    // Apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const rateLimitResponse = rateLimit(request);
      if (rateLimitResponse) return rateLimitResponse;
    }
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
