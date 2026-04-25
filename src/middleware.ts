import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that never require authentication
const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/sheets',         // public read endpoint (API-key gated, not session-gated)
  '/api/sheets/write',   // API-key gated
  '/api/payments/verify',
  '/api/users/sync',
  '/api/cron(.*)',
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // Block obviously invalid API key formats early (before hitting DB)
  const apiKey = req.headers.get('x-api-key');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/sheets');

  if (isApiRoute && apiKey && !apiKey.startsWith('gl_')) {
    return NextResponse.json(
      { success: false, data: null, error: 'Invalid API key format. Keys must start with gl_' },
      { status: 401 },
    );
  }

  if (!isPublic(req)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
