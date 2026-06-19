export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { calculateLifePath, calculateBirthdayNumber, calculatePersonalYear } from '@/lib/numerology';
import { sanitizeString, validateDate, getClientIP, rateLimit, rateLimitResponse, logSecurityEvent } from '@/lib/security';

async function notifyAdmin(params: {
  customerName: string;
  customerEmail: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  lifePathNumber: number;
  personalYear: number;
  questions: string;
  readingId: string;
}) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL || 'himanshoumehtta@gmail.com';
    const adminUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://naksh369.netlify.app';

    if (!apiKey || !fromEmail) return;

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: adminEmail }] }],
        from: { email: fromEmail, name: 'NAKSH369 Platform' },
        subject: `🔔 New Reading Request — ${params.customerName} (Life Path ${params.lifePathNumber})`,
        content: [{
          type: 'text/html',
          value: `
<div style="font-family:Georgia,serif;background:#0A0612;color:#E8E8F0;padding:32px 24px;max-width:600px;margin:0 auto;">
  <div style="border-bottom:2px solid #D4A820;padding-bottom:20px;margin-bottom:24px;">
    <h1 style="color:#D4A820;font-size:22px;letter-spacing:3px;margin:0;">NAKSH369</h1>
    <p style="color:#A0A0C0;font-size:13px;margin:4px 0 0;">🔔 New Reading Request</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;width:140px;">Name</td><td style="color:#E8E8F0;font-size:13px;font-weight:500;">${params.customerName}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">Email</td><td style="color:#E8E8F0;font-size:13px;">${params.customerEmail}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">DOB</td><td style="color:#E8E8F0;font-size:13px;">${params.dob}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">Birth Time</td><td style="color:#E8E8F0;font-size:13px;">${params.birthTime || 'Not provided'}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">Birth Place</td><td style="color:#E8E8F0;font-size:13px;">${params.birthPlace}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">Gender</td><td style="color:#E8E8F0;font-size:13px;text-transform:capitalize;">${params.gender}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">Life Path</td><td style="color:#D4A820;font-size:20px;font-weight:bold;">${params.lifePathNumber}</td></tr>
    <tr><td style="color:#808098;font-size:12px;padding:6px 0;">Personal Year</td><td style="color:#D4A820;font-size:16px;">${params.personalYear}</td></tr>
  </table>
  ${params.questions ? `<div style="background:#1A1430;border:1px solid #261D45;border-radius:4px;padding:16px;margin-bottom:20px;"><p style="color:#A0A0C0;font-size:11px;margin:0 0 8px;">CLIENT QUESTIONS</p><p style="color:#C8C8E0;font-size:13px;margin:0;">${params.questions}</p></div>` : ''}
  <div style="text-align:center;margin-top:24px;">
    <a href="${adminUrl}/admin" style="display:inline-block;background:linear-gradient(135deg,#D4A820,#F0D080);color:#0A0612;text-decoration:none;padding:14px 40px;font-weight:bold;font-size:14px;border-radius:2px;">Open Admin Panel →</a>
  </div>
</div>`
        }]
      })
    });
  } catch (err) {
    console.error('Admin notification error:', err);
  }
}

export async function POST(request: Request) {
  const ip = getClientIP(request);

  // Rate limit: 3 readings per 10 minutes per IP
  if (!rateLimit(ip, 3, 600000)) {
    logSecurityEvent('READING_RATE_LIMIT', ip);
    return rateLimitResponse();
  }

  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const body = await request.json();

    // Sanitize all inputs
    const firstName = sanitizeString(body.firstName || '');
    const dob = body.dob || '';
    const birthTime = sanitizeString(body.birthTime || '');
    const birthPlace = sanitizeString(body.birthPlace || '');
    const gender = sanitizeString(body.gender || '');
    const questions = sanitizeString(body.questions || '').substring(0, 500);
    const readingType = sanitizeString(body.readingType || 'blueprint');

    // Validate required fields
    if (!dob || !validateDate(dob)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid date of birth' }, { status: 400 });
    }
    if (!birthPlace || birthPlace.length < 2) {
      return NextResponse.json({ success: false, message: 'Please enter your birth place' }, { status: 400 });
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json({ success: false, message: 'Please select a valid gender' }, { status: 400 });
    }

    const lifePathNumber = calculateLifePath(dob);
    const birthdayNumber = calculateBirthdayNumber(dob);
    const personalYear = calculatePersonalYear(dob, new Date().getFullYear());

    // Create client profile
    const { data: clientProfile, error: profileError } = await supabaseAdmin
      .from('client_profiles')
      .insert({
        user_id: user!.id,
        first_name: firstName,
        dob,
        birth_time: birthTime || null,
        birth_time_uncertain: !birthTime,
        birth_place: birthPlace,
        birth_place_lat: null,
        birth_place_lng: null,
        gender,
        life_path_number: lifePathNumber,
        birthday_number: birthdayNumber,
        personal_year: personalYear,
      })
      .select()
      .single();

    if (profileError || !clientProfile) {
      return NextResponse.json({ success: false, message: 'Failed to save profile' }, { status: 400 });
    }

    // Create reading
    const { data: reading, error: readingError } = await supabaseAdmin
      .from('readings')
      .insert({
        user_id: user!.id,
        client_profile_id: clientProfile.id,
        reading_type: readingType,
        questions: questions || null,
        status: 'pending',
      })
      .select()
      .single();

    if (readingError || !reading) {
      return NextResponse.json({ success: false, message: 'Failed to create reading' }, { status: 400 });
    }

    // Get user email for notification
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', user!.id)
      .single();

    // CRM log
    await supabaseAdmin.from('crm_tracking').insert({
      user_id: user!.id,
      interaction_type: 'reading_requested',
      details: { reading_id: reading.id, life_path: lifePathNumber, ip },
    });

    // Notify admin (non-blocking)
    notifyAdmin({
      customerName: firstName || userData?.first_name || 'Unknown',
      customerEmail: userData?.email || '',
      dob,
      birthTime,
      birthPlace,
      gender,
      lifePathNumber,
      personalYear,
      questions,
      readingId: reading.id,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Reading request submitted successfully.',
      data: { readingId: reading.id, lifePathNumber, personalYear },
    });
  } catch (error) {
    logSecurityEvent('READING_CREATE_ERROR', ip, String(error));
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { data: readings } = await supabaseAdmin
      .from('readings')
      .select('*, client_profiles(*), blueprints(pdf_url, generation_status, generated_at)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, data: readings || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
