export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { readingId, name } = await request.json();

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, first_name')
      .eq('id', user!.id)
      .single();

    const { data: reading } = await supabaseAdmin
      .from('readings')
      .select('*, client_profiles(*)')
      .eq('id', readingId)
      .single();

    if (readingId) {
      await supabaseAdmin
        .from('readings')
        .update({ status: 'payment_claimed' })
        .eq('id', readingId);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'himanshoumehtta@gmail.com';
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const apiKey = process.env.SENDGRID_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://naksh369.com';

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
          subject: `Payment Claimed - ${name || userData?.first_name} paid Rs.999`,
          content: [{
            type: 'text/html',
            value: `<div style="font-family:Georgia,serif;padding:32px;">
              <h1 style="color:#D4A820;">NAKSH369 - Payment Claimed</h1>
              <p><strong>Customer:</strong> ${name || userData?.first_name}</p>
              <p><strong>Email:</strong> ${userData?.email}</p>
              <p><strong>Amount:</strong> Rs.999</p>
              <p><strong>UPI ID:</strong> 9167090026@ptsbi</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
              <p><a href="${appUrl}/admin" style="background:#D4A820;color:#000;padding:12px 24px;text-decoration:none;">Open Admin Panel</a></p>
            </div>`
          }]
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
