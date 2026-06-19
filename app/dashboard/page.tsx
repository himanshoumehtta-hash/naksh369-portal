'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Under Review', cls: 'badge-pending' },
  payment_claimed: { label: 'Payment Claimed', cls: 'badge-payment' },
  approved: { label: 'Being Prepared', cls: 'badge-approved' },
  processing: { label: 'Generating', cls: 'badge-processing' },
  delivered: { label: 'Delivered', cls: 'badge-delivered' },
  rejected: { label: 'Not Approved', cls: 'badge-rejected' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('naksh_token');
    const userData = localStorage.getItem('naksh_user');
    if (!token) { router.push('/auth/login'); return; }
    setUser(userData ? JSON.parse(userData) : null);
    fetch('/api/readings/create', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.success) setReadings(data.data); })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--cream-2)', minHeight: '100vh', paddingBottom: '60px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--teal-deep), var(--teal-darker))', padding: 'clamp(32px,5vw,56px) var(--pad)' }}>
          <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '8px' }}>YOUR PORTAL</div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 300, fontSize: 'clamp(28px,4vw,44px)', color: 'var(--cream)', lineHeight: 1.1 }}>
              {user?.first_name ? `Welcome, ${user.first_name}` : 'Your Dashboard'}
            </h1>
            <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '15px', color: 'rgba(253,248,239,0.7)', marginTop: '8px' }}>
              Your readings and life blueprints
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '32px var(--pad)' }}>
          {/* New Reading CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--cream)', border: '1px solid var(--line)', padding: '20px 24px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--f-caps)', fontSize: '11px', fontWeight: 600, color: 'var(--teal-deep)', letterSpacing: '1px', marginBottom: '4px' }}>Request a New Reading</div>
              <div style={{ fontFamily: 'var(--f-sans)', fontSize: '12px', color: 'var(--warm-muted)' }}>Life Blueprint · Personalized · Delivered within 48 hours</div>
            </div>
            <Link href="/reading" className="btn-naksh btn-saffron" style={{ flexShrink: 0 }}>New Reading →</Link>
          </div>

          {/* Readings */}
          <div className="naksh-sec-label" style={{ marginBottom: '20px' }}>Your Readings</div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--warm-muted)' }}>Loading your readings...</div>
          ) : readings.length === 0 ? (
            <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-dev)', fontSize: '32px', color: 'var(--saff-deep)', marginBottom: '16px' }}>ॐ</div>
              <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '16px', color: 'var(--warm-mid)', marginBottom: '20px' }}>No readings yet. Begin your cosmic journey.</p>
              <Link href="/reading" className="btn-naksh btn-saffron">Request Your First Blueprint →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {readings.map((reading: any) => {
                const status = statusConfig[reading.status] || { label: reading.status, cls: 'badge-pending' };
                const profile = reading.client_profiles;
                const blueprint = reading.blueprints?.[0];
                return (
                  <div key={reading.id} style={{ background: 'var(--cream)', border: '1px solid var(--line)', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--f-caps)', fontSize: '12px', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '4px', textTransform: 'capitalize' }}>{reading.reading_type} Reading</div>
                        <div style={{ fontFamily: 'var(--f-sans)', fontSize: '11px', color: 'var(--warm-muted)' }}>{new Date(reading.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <span className={`naksh-badge ${status.cls}`}>{status.label}</span>
                    </div>

                    {profile && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', marginBottom: '16px' }}>
                        <div className="naksh-stat">
                          <div className="naksh-stat-num"><em>{profile.life_path_number}</em></div>
                          <div className="naksh-stat-label">Life Path</div>
                        </div>
                        <div className="naksh-stat">
                          <div className="naksh-stat-num">{profile.personal_year}</div>
                          <div className="naksh-stat-label">Personal Year</div>
                        </div>
                        <div className="naksh-stat">
                          <div style={{ fontFamily: 'var(--f-sans)', fontSize: '12px', color: 'var(--warm-mid)', marginTop: '4px' }}>{profile.birth_place}</div>
                          <div className="naksh-stat-label" style={{ marginTop: '4px' }}>Birth Place</div>
                        </div>
                      </div>
                    )}

                    {reading.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link href={`/payment?readingId=${reading.id}`} className="btn-naksh btn-saffron" style={{ fontSize: '10px', padding: '10px 20px' }}>Complete Payment →</Link>
                        <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '12px', color: 'var(--warm-muted)' }}>Payment pending</span>
                      </div>
                    )}
                    {reading.status === 'payment_claimed' && (
                      <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '13px', color: 'var(--warm-mid)' }}>✓ Payment claimed — awaiting verification by NAKSH369</p>
                    )}
                    {blueprint?.pdf_url && reading.status === 'delivered' && (
                      <a href={blueprint.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-naksh btn-saffron" style={{ fontSize: '10px', padding: '10px 20px', display: 'inline-flex' }}>
                        Download Blueprint PDF ↓
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
