'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function ReadingPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ firstName: '', dob: '', birthTime: '', birthPlace: '', gender: '', questions: '', readingType: 'blueprint' });

  useEffect(() => {
    const t = localStorage.getItem('naksh_token');
    if (!t) { router.push('/auth/login'); return; }
    setToken(t);
    const user = JSON.parse(localStorage.getItem('naksh_user') || '{}');
    if (user.first_name) setForm(f => ({ ...f, firstName: user.first_name }));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/readings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Submission failed'); return; }
      setResult(data.data);
      setSubmitted(true);
      setTimeout(() => router.push(`/payment?readingId=${data.data.readingId}`), 2000);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  if (submitted && result) return (
    <>
      <Nav />
      <main style={{ background: 'var(--cream-2)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--f-dev)', fontSize: '48px', color: 'var(--saff-deep)', marginBottom: '20px' }}>ॐ</div>
          <h1 className="naksh-sec-h" style={{ marginBottom: '24px' }}>Reading <em>Submitted</em></h1>
          <div className="naksh-card" style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '3px', color: 'var(--gold-deep)', marginBottom: '16px' }}>YOUR LIFE PATH NUMBER</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '80px', fontWeight: 300, color: 'var(--teal-deep)', lineHeight: 1, marginBottom: '12px' }}>
              <span style={{ fontStyle: 'italic', color: 'var(--saffron)' }}>{result.lifePathNumber}</span>
            </div>
            <div style={{ fontFamily: 'var(--f-sans)', fontSize: '12px', color: 'var(--warm-muted)' }}>
              Personal Year {new Date().getFullYear()}: <strong style={{ color: 'var(--teal-deep)' }}>{result.personalYear}</strong>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '15px', color: 'var(--warm-mid)', lineHeight: 1.6 }}>
            Redirecting you to payment...
          </p>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--cream-2)', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="naksh-page" style={{ maxWidth: '680px' }}>
          <div style={{ padding: 'clamp(32px,5vw,60px) 0 32px' }}>
            <div className="naksh-sec-label">Life Blueprint Request</div>
            <h1 className="naksh-sec-h">Tell Us About <em>Your Birth</em></h1>
            <p className="naksh-sec-sub">The more precise your birth data, the deeper your reading.</p>
          </div>
          <div className="naksh-card">
            <span style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '2.5px', color: 'var(--gold-deep)', borderBottom: '1px solid var(--line-soft)', paddingBottom: '12px', marginBottom: '20px', display: 'block' }}>BIRTH DETAILS</span>
            <form onSubmit={handleSubmit}>
              <label className="naksh-label">Your Name</label>
              <input type="text" required className="naksh-input" placeholder="As you'd like to be addressed"
                value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />

              <div className="grid-2">
                <div>
                  <label className="naksh-label">Date of Birth</label>
                  <input type="date" required className="naksh-input"
                    value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                </div>
                <div>
                  <label className="naksh-label">Gender</label>
                  <select required className="naksh-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <label className="naksh-label">Birth Time <span style={{ textTransform: 'none', letterSpacing: 0, fontStyle: 'italic' }}>(optional — enables Vedic chart)</span></label>
              <input type="time" className="naksh-input"
                value={form.birthTime} onChange={e => setForm(f => ({ ...f, birthTime: e.target.value }))} />
              <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '12px', color: 'var(--warm-muted)', display: 'block', marginTop: '-10px', marginBottom: '14px' }}>Leave blank if unknown — reading remains deeply accurate</span>

              <label className="naksh-label">Birth Place</label>
              <input type="text" required className="naksh-input" placeholder="City, Country (e.g. Mumbai, India)"
                value={form.birthPlace} onChange={e => setForm(f => ({ ...f, birthPlace: e.target.value }))} />

              <label className="naksh-label">Your Questions <span style={{ textTransform: 'none', letterSpacing: 0, fontStyle: 'italic' }}>(optional)</span></label>
              <textarea rows={4} className="naksh-input" placeholder="What would you like guidance on? Career, relationships, life purpose, a specific decision..."
                value={form.questions} onChange={e => setForm(f => ({ ...f, questions: e.target.value }))} />

              {error && <div className="naksh-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn-naksh btn-saffron btn-full">
                {loading ? 'Submitting...' : 'Submit for Reading →'}
              </button>
              <p style={{ textAlign: 'center', fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '12px', color: 'var(--warm-muted)', marginTop: '12px', lineHeight: 1.5 }}>
                For spiritual guidance purposes only · Delivered within 24–48 hours
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
