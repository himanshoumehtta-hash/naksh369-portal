// Email via SendGrid REST API (no SDK needed)
// WhatsApp via Twilio REST API (no SDK needed)

export async function sendBlueprintEmail(
  toEmail: string,
  clientName: string,
  pdfUrl: string
): Promise<boolean> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const fromName = process.env.SENDGRID_FROM_NAME || 'NAKSH369';

    if (!apiKey || !fromEmail) {
      console.warn('SendGrid not configured — skipping email');
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: fromName },
        subject: `✨ Your NAKSH369 Life Blueprint is Ready, ${clientName}`,
        content: [
          {
            type: 'text/html',
            value: buildEmailHtml(clientName, pdfUrl),
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('SendGrid error:', err);
      return false;
    }

    return true;
  } catch (error) {
    console.error('sendBlueprintEmail error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  toEmail: string,
  clientName: string
): Promise<boolean> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!apiKey || !fromEmail) return false;

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: 'NAKSH369' },
        subject: 'Welcome to NAKSH369 ✨',
        content: [
          {
            type: 'text/html',
            value: `
<div style="font-family:Georgia,serif;background:#0A0612;color:#E8E8F0;padding:40px 20px;max-width:600px;margin:0 auto;">
  <h1 style="color:#D4A820;letter-spacing:3px;font-size:24px;">NAKSH369</h1>
  <p>Dear ${clientName},</p>
  <p>Welcome. Your journey inward begins here.</p>
  <p>We have received your reading request. Your Life Blueprint will be delivered within 24–48 hours.</p>
  <p>With light,<br><strong>NAKSH369</strong></p>
  <p style="font-size:11px;color:#404060;margin-top:32px;">For spiritual guidance and entertainment purposes only.</p>
</div>`,
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return false;
  }
}

export async function sendBlueprintWhatsApp(
  toNumber: string,
  clientName: string,
  pdfUrl: string
): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio not configured — skipping WhatsApp');
      return false;
    }

    // Format number
    let formattedTo = toNumber.replace(/\s/g, '');
    if (!formattedTo.startsWith('whatsapp:')) {
      if (!formattedTo.startsWith('+')) {
        formattedTo = '+' + formattedTo.replace(/\D/g, '');
      }
      formattedTo = `whatsapp:${formattedTo}`;
    }

    const body = `✨ *NAKSH369 Life Blueprint Ready*\n\nDear ${clientName},\n\nYour personalized Life Blueprint has been prepared.\n\n📄 Download here:\n${pdfUrl}\n\nWith cosmic light 🙏\n_NAKSH369_`;

    const params = new URLSearchParams({
      From: fromNumber,
      To: formattedTo,
      Body: body,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Twilio error:', err);
      return false;
    }

    return true;
  } catch (error) {
    console.error('sendBlueprintWhatsApp error:', error);
    return false;
  }
}

function buildEmailHtml(clientName: string, pdfUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#0A0612;color:#E8E8F0;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="border-bottom:1px solid #D4A820;padding-bottom:24px;margin-bottom:28px;">
      <h1 style="color:#D4A820;font-size:24px;letter-spacing:4px;margin:0 0 6px;">NAKSH369</h1>
      <p style="color:#A0A0C0;font-size:13px;margin:0;">Your Life Blueprint Has Arrived</p>
    </div>
    <p style="color:#C8C8E0;line-height:1.8;">Dear ${clientName},</p>
    <p style="color:#C8C8E0;line-height:1.8;">
      Your personalized Life Blueprint has been prepared with care and cosmic precision.
      Within it you will find deep insights into your life path, purpose, relationships,
      and the energies shaping your year ahead.
    </p>
    <p style="color:#C8C8E0;line-height:1.8;">This is your unique soul map — read it slowly, with an open heart.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${pdfUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#D4A820,#F0D080);
                color:#0A0612;text-decoration:none;padding:14px 40px;
                font-weight:bold;font-size:14px;letter-spacing:1px;">
        Download Your Blueprint ✨
      </a>
    </div>
    <p style="color:#C8C8E0;line-height:1.8;">
      If you have questions or would like a deeper reading, reply to this email.
    </p>
    <p style="color:#C8C8E0;">With light,<br><strong>NAKSH369</strong></p>
    <div style="border-top:1px solid #261D45;margin-top:32px;padding-top:16px;">
      <p style="color:#404060;font-size:11px;line-height:1.6;">
        This reading is for spiritual guidance and entertainment purposes only.
        It does not constitute medical, legal, or financial advice.
      </p>
      <p style="color:#404060;font-size:11px;">© ${new Date().getFullYear()} NAKSH369</p>
    </div>
  </div>
</body>
</html>`;
}
