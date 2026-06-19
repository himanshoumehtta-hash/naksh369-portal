import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limit store (edge-compatible simple version)
const requests = new Map<string, number[]>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const ipRequests = (requests.get(ip) || []).filter(t => t > windowStart);
  ipRequests.push(now);
  requests.set(ip, ipRequests);
  return ipRequests.length > limit;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';

  const response = NextResponse.next();

  // ── Security Headers (all routes) ────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // ── Rate Limiting for API routes ──────────────────────────────────────────
  if (pathname.startsWith('/api/')) {

    // Strict limit for auth endpoints (prevent brute force)
    if (pathname.startsWith('/api/auth/')) {
      if (isRateLimited(ip, 5, 60000)) { // 5 per minute
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Too many attempts. Please wait 1 minute.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Standard limit for other APIs
    if (pathname.startsWith('/api/readings/') || pathname.startsWith('/api/payment/')) {
      if (isRateLimited(ip, 20, 60000)) { // 20 per minute
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Too many requests. Please slow down.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Admin endpoints — stricter
    if (pathname.startsWith('/api/admin/')) {
      if (isRateLimited(ip, 30, 60000)) { // 30 per minute
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Rate limit exceeded.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|paytm-qr.jpg|phonepe-qr.jpg).*)',
  ],
};
