export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { readingId, name } = await request.json();

    // Get user info
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', user!.id)
      .single();

    // Get reading info
    const { data: reading } = await supabaseAdmin
      .from('readings')
      .select('*, client_profiles(*)')
      .eq('id', readingId)
      .single();

    // Update reading status to 'payment_claimed'
    if (readingId) {
      await supabaseAdmin
        .from('readings')
        .update({ 
          status: 'payment_claimed',
          questions: reading?.questions ? 
            reading.questions + '

[PAYMENT CLAIMED VIA UPI - ₹999]' : 
            '[PAYMENT CLAIMED VIA UPI - ₹999]'
        })
        .eq('id', readingId);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'himanshoumehtta@gmail.com';
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const apiKey = process.env.SENDGRID_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://naksh369.netlify.app';

    if (apiKey && fromEmail) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: adminEmail }] }],
          from: { email: fromEmail, name: 'NAKSH369 Payments' },
          subject: `💰 Payment Claimed — ${name || userData?.first_name} paid ₹999`,
          content: [{
            type: 'text/html',
            value: `
<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0A0612;color:#E8E8F0;padding:32px 24px;max-width:600px;margin:0 auto;">
  <div style="border-bottom:2px solid #D4A820;padding-bottom:20px;margin-bottom:24px;">
    <h1 style="color:#D4A820;font-size:22px;letter-spacing:3px;margin:0 0 4px;">NAKSH369</h1>
    <p style="color:#A0A0C0;font-size:13px;margin:0;">💰 Payment Claimed</p>
  </div>

  <div style="background:#1A1430;border:1px solid #261D45;border-radius:4px;padding:20px;margin-bottom:20px;">
    <h2 style="color:#F0D080;font-size:16px;margin:0 0 16px;">Payment Details</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;width:140px;">Customer Name</td>
        <td style="color:#E8E8F0;font-size:14px;padding:6px 0;font-weight:500;">${name || userData?.first_name || 'Unknown'}</td>
      </tr>
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;">Email</td>
        <td style="color:#E8E8F0;font-size:13px;padding:6px 0;">${userData?.email || 'Unknown'}</td>
      </tr>
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;">Amount</td>
        <td style="color:#D4A820;font-size:20px;padding:6px 0;font-weight:bold;">₹999</td>
      </tr>
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;">UPI ID</td>
        <td style="color:#E8E8F0;font-size:13px;padding:6px 0;">9167090026@ptsbi</td>
      </tr>
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;">Time</td>
        <td style="color:#E8E8F0;font-size:13px;padding:6px 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
      </tr>
      ${reading?.client_profiles ? `
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;">Birth Place</td>
        <td style="color:#E8E8F0;font-size:13px;padding:6px 0;">${reading.client_profiles.birth_place}</td>
      </tr>
      <tr>
        <td style="color:#808098;font-size:12px;padding:6px 0;">Life Path</td>
        <td style="color:#D4A820;font-size:18px;padding:6px 0;">${reading.client_profiles.life_path_number}</td>
      </tr>
      ` : ''}
    </table>
  </div>

  <div style="background:#1A2010;border:1px solid #2A3A10;border-radius:4px;padding:16px;margin-bottom:20px;">
    <p style="color:#90C040;font-size:13px;margin:0;">
      ⚠️ Please verify this payment on your Paytm/PhonePe app before approving.<br>
      Check for ₹999 received from customer around this time.
    </p>
  </div>

  <div style="text-align:center;margin:24px 0;">
    <a href="${appUrl}/admin"
       style="display:inline-block;background:linear-gradient(135deg,#D4A820,#F0D080);
              color:#0A0612;text-decoration:none;padding:14px 40px;
              font-weight:bold;font-size:14px;letter-spacing:1px;border-radius:2px;">
      Verify & Approve in Admin Panel →
    </a>
  </div>

  <p style="color:#606080;font-size:11px;text-align:center;">
    Reading ID: ${readingId} · NAKSH369 Platform
  </p>
</body>
</html>`,
          }],
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'Payment notification sent' });
  } catch (error) {
    console.error('Payment notify error:', error);
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}
