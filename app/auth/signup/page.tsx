'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', email: '', password: '', whatsappNumber: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Signup failed'); return; }
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (loginData.success) {
        localStorage.setItem('naksh_token', loginData.token);
        localStorage.setItem('naksh_user', JSON.stringify(loginData.user));
        router.push('/reading');
      } else {
        router.push('/auth/login');
      }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--cream-2)', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="naksh-page" style={{ maxWidth: '540px' }}>
          <div style={{ textAlign: 'center', padding: 'clamp(32px,5vw,60px) 0 32px' }}>
            <div className="naksh-sec-label" style={{ justifyContent: 'center' }}>Begin Your Journey</div>
            <h1 className="naksh-sec-h">Create Your Account</h1>
            <p className="naksh-sec-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
              Join thousands who have discovered their cosmic blueprint
            </p>
          </div>

          <div className="naksh-card">
            <span style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', fontWeight: 500, letterSpacing: '2.5px', color: 'var(--gold-deep)', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px', marginBottom: '18px', display: 'block' }}>
              PERSONAL DETAILS
            </span>
            <form onSubmit={handleSubmit}>
              <label className="naksh-label">Your Name</label>
              <input type="text" required className="naksh-input" placeholder="As you'd like to be addressed"
                value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />

              <label className="naksh-label">Email Address</label>
              <input type="email" required className="naksh-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />

              <label className="naksh-label">Password</label>
              <input type="password" required minLength={8} className="naksh-input" placeholder="Minimum 8 characters"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

              <label className="naksh-label">WhatsApp Number <span style={{ textTransform: 'none', letterSpacing: 0, fontStyle: 'italic' }}>(optional — for delivery)</span></label>
              <input type="tel" className="naksh-input" placeholder="+91 98765 43210"
                value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))} />

              {error && <div className="naksh-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn-naksh btn-saffron btn-full">
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '14px', color: 'var(--warm-muted)', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--saff-deep)', textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
