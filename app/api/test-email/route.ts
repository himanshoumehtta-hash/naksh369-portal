import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL || 'himanshoumehtta@gmail.com';

    if (!apiKey) return NextResponse.json({ error: 'No SENDGRID_API_KEY' });
    if (!fromEmail) return NextResponse.json({ error: 'No SENDGRID_FROM_EMAIL' });

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: adminEmail }] }],
        from: { email: fromEmail, name: 'NAKSH369 Test' },
        subject: '✅ NAKSH369 Email Test — It Works!',
        content: [{
          type: 'text/html',
          value: '<h1 style="color:#D4A820">NAKSH369 Email is working!</h1><p>If you see this, your email setup is correct.</p>'
        }],
      }),
    });

    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      fromEmail,
      adminEmail,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      sendgridResponse: responseText || 'empty (success)',
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
