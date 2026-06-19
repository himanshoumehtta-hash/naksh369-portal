-e export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeEmail, getClientIP, rateLimit, rateLimitResponse, logSecurityEvent } from '@/lib/security';

export async function POST(request: Request) {
  const ip = getClientIP(request);

  // Rate limit: 5 login attempts per minute per IP (brute force protection)
  if (!rateLimit(ip, 5, 60000)) {
    logSecurityEvent('LOGIN_RATE_LIMIT', ip);
    return rateLimitResponse();
  }

  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email || '');
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      // Don't reveal if email exists or not
      logSecurityEvent('LOGIN_FAILED', ip, email);
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // Get user profile
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, whatsapp_number, role')
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: userData?.id,
        email: userData?.email || data.user.email,
        first_name: userData?.first_name,
        role: userData?.role || 'user',
      },
    });
  } catch (error) {
    logSecurityEvent('LOGIN_ERROR', ip, String(error));
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
