# NAKSH369 — Deployment Guide
## From zero to live in ~2 hours

---

## STEP 1: Supabase Setup (15 min)

1. Go to supabase.com → New project → name it `naksh369`
2. Wait for project to provision (2–3 min)
3. Go to **SQL Editor** → New query
4. Copy-paste the entire contents of `supabase/schema.sql`
5. Click **Run** — wait for all statements to succeed
6. Go to **Storage** → New bucket:
   - Name: `blueprints`
   - Public: **ON**
7. Note your credentials from **Settings → API**:
   - Project URL
   - anon/public key
   - service_role key (secret — keep private)

---

## STEP 2: Create Your Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

CLAUDE_API_KEY=sk-ant-...

SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=readings@naksh369.com
SENDGRID_FROM_NAME=NAKSH369

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Astrology API keys are optional for launch — the blueprint generation works without them.

---

## STEP 3: Create Admin User

1. Go to Supabase Dashboard → **Authentication → Users**
2. Click **Add User**:
   - Email: `himanshoumehtta@gmail.com`
   - Password: (choose something strong)
   - Check "Auto Confirm User"
3. Go back to **SQL Editor** and run:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'himanshoumehtta@gmail.com';
```

---

## STEP 4: Local Test

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and verify:
- [ ] Landing page loads
- [ ] Sign up works (creates user in Supabase Auth)
- [ ] Reading form submits
- [ ] Admin login redirects to /admin
- [ ] Admin dashboard shows readings
- [ ] `/api/health` returns `{ success: true }`

---

## STEP 5: GitHub

```bash
git init
git add .
git commit -m "NAKSH369 initial build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/naksh369-portal.git
git push -u origin main
```

---

## STEP 6: Vercel Deployment

1. Go to vercel.com → **New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. **Environment Variables** — add all from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLAUDE_API_KEY`
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `SENDGRID_FROM_NAME`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
5. Click **Deploy**
6. After deploy, update `NEXT_PUBLIC_APP_URL` to the actual Vercel URL

---

## STEP 7: SendGrid Sender Verification

1. Go to sendgrid.com → Settings → Sender Authentication
2. Verify `readings@naksh369.com` (or whatever email you're using)
3. Without this, emails will fail

---

## STEP 8: Twilio WhatsApp (Sandbox for testing)

1. Go to twilio.com → Messaging → Try it out → Send a WhatsApp message
2. Use sandbox number: `whatsapp:+14155238886`
3. Your customers must first send "join [your-word]" to activate sandbox
4. For production: upgrade to a paid Twilio number

---

## Live Flow (How It Works)

```
Customer visits naksh369.com
→ Signs up (email + optional WhatsApp)
→ Fills reading form (DOB, birth place, questions)
→ Reading created with status: PENDING
→ You see it in /admin

YOU (admin):
→ Log in at /admin
→ Review the reading
→ Click "Approve"
→ Click "✨ Generate & Deliver Blueprint"
→ Claude AI generates personalized blueprint (30–60 sec)
→ PDF created and uploaded to Supabase Storage
→ Email sent to customer via SendGrid
→ WhatsApp sent via Twilio (if number provided)
→ Status → DELIVERED
→ Customer can download from /dashboard
```

---

## Troubleshooting

**Build fails on Vercel:**
- Check all env vars are set correctly
- Run `npm run build` locally first to catch errors

**"Invalid token" errors:**
- Supabase JWT may have expired; user needs to log in again
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct in Vercel

**Blueprint generation fails:**
- Check `CLAUDE_API_KEY` is valid
- Check Vercel function timeout (default 10s — upgrade to Pro for 60s if needed)

**Emails not sending:**
- Verify sender email in SendGrid
- Check `SENDGRID_API_KEY` starts with `SG.`

**WhatsApp not delivering:**
- Sandbox requires opt-in from recipient
- Check Twilio account has credits

---

## Custom Domain (Optional)

1. Vercel → Project → Settings → Domains → Add `naksh369.com`
2. Update DNS at your registrar:
   - A record: `@` → `76.76.19.132`
   - CNAME: `www` → `cname.vercel-dns.com`
3. Update `NEXT_PUBLIC_APP_URL` env var to `https://naksh369.com`

---

Good luck, Himanshou! 🌟
