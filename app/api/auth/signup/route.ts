-e export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
import { sanitizeString, sanitizeEmail, validatePhone, getClientIP, rateLimit, rateLimitResponse, logSecurityEvent } from '@/lib/security';

export async function POST(request: Request) {
  const ip = getClientIP(request);

  // Rate limit: 5 signups per minute per IP
  if (!rateLimit(ip, 5, 60000)) {
    logSecurityEvent('SIGNUP_RATE_LIMIT', ip);
    return rateLimitResponse();
  }

  try {
    const body = await request.json();

    // Sanitize all inputs
    const firstName = sanitizeString(body.firstName || '');
    const email = sanitizeEmail(body.email || '');
    const password = body.password || '';
    const whatsappNumber = validatePhone(body.whatsappNumber || '');

    // Validate
    if (!firstName || firstName.length < 2) {
      return NextResponse.json({ success: false, message: 'Please enter your name (min 2 characters)' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Password strength check
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json({ success: false, message: 'Password must contain both letters and numbers' }, { status: 400 });
    }

    // Create auth user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName },
    });

    if (authError || !user) {
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: authError?.message || 'Signup failed' }, { status: 400 });
    }

    // Update user profile
    await supabaseAdmin.from('users').upsert({
      id: user.id,
      email,
      first_name: firstName,
      whatsapp_number: whatsappNumber || null,
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, firstName).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId: user.id,
    });
  } catch (error) {
    logSecurityEvent('SIGNUP_ERROR', ip, String(error));
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
