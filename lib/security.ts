import { NextResponse } from 'next/server';

// ─── Rate Limiting (in-memory, resets on server restart) ───────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // allowed
  }

  if (record.count >= maxRequests) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
}

// ─── Get client IP ──────────────────────────────────────────────────────────
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || real || 'unknown';
}

// ─── Rate limit response ────────────────────────────────────────────────────
export function rateLimitResponse() {
  return NextResponse.json(
    { success: false, message: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
}

// ─── Input Sanitization ─────────────────────────────────────────────────────
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .substring(0, 1000); // max length
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : '';
}

export function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime()) && d < new Date();
}

export function validatePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 ? digits : '';
}

// ─── Security Headers ───────────────────────────────────────────────────────
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.sendgrid.com;"
  );
  return response;
}

// ─── CORS Check ─────────────────────────────────────────────────────────────
export function checkCORS(request: Request): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://naksh369.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  if (!origin) return true; // server-to-server
  return allowedOrigins.some(allowed => origin.startsWith(allowed as string));
}

// ─── Validate request body size ─────────────────────────────────────────────
export function validateBodySize(body: string, maxKB: number = 50): boolean {
  const sizeKB = new Blob([body]).size / 1024;
  return sizeKB <= maxKB;
}

// ─── Log security event ──────────────────────────────────────────────────────
export function logSecurityEvent(event: string, ip: string, details?: string) {
  console.warn(`[SECURITY] ${new Date().toISOString()} | ${event} | IP: ${ip} | ${details || ''}`);
}
