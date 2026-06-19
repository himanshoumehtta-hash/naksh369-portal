'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Login failed'); return; }
      localStorage.setItem('naksh_token', data.token);
      localStorage.setItem('naksh_user', JSON.stringify(data.user));
      if (data.user?.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--cream-2)', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="naksh-page" style={{ maxWidth: '540px' }}>
          <div style={{ textAlign: 'center', padding: 'clamp(32px,5vw,60px) 0 32px' }}>
            <div className="naksh-sec-label" style={{ justifyContent: 'center' }}>Welcome Back</div>
            <h1 className="naksh-sec-h">Sign In</h1>
            <p className="naksh-sec-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
              Access your blueprints and readings
            </p>
          </div>
          <div className="naksh-card">
            <span style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '2.5px', color: 'var(--gold-deep)', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px', marginBottom: '18px', display: 'block' }}>YOUR CREDENTIALS</span>
            <form onSubmit={handleSubmit}>
              <label className="naksh-label">Email Address</label>
              <input type="email" required className="naksh-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <label className="naksh-label">Password</label>
              <input type="password" required className="naksh-input" placeholder="Your password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              {error && <div className="naksh-error">{error}</div>}
              <button type="submit" disabled={loading} className="btn-naksh btn-saffron btn-full">
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '14px', color: 'var(--warm-muted)', marginTop: '20px' }}>
            New here?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--saff-deep)', textDecoration: 'none' }}>Create an account →</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
