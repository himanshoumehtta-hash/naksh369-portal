'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'badge-pending' },
  payment_claimed: { label: '💰 Payment Claimed', cls: 'badge-payment' },
  approved: { label: 'Approved', cls: 'badge-approved' },
  processing: { label: 'Processing', cls: 'badge-processing' },
  delivered: { label: 'Delivered', cls: 'badge-delivered' },
  rejected: { label: 'Rejected', cls: 'badge-rejected' },
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const token = typeof window !== 'undefined' ? localStorage.getItem('naksh_token') : '';

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) { if (res.status === 403) router.push('/dashboard'); return; }
      setStats(data.data.stats);
      setReadings(data.data.readings);
    } finally { setLoading(false); }
  };

  const viewReport = (html: string, name: string) => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>NAKSH369 Blueprint — ${name}</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #3D2B1A; line-height: 1.7; background: #FDF8EF; }
  h2 { color: #0D4A52; border-bottom: 2px solid #C9A84C; padding-bottom: 8px; margin-top: 28px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  .blueprint { background: #fff; padding: 40px; border: 1px solid #C9A84C; }
  @media print { body { background: #fff; } .no-print { display: none; } }
  .header { text-align: center; margin-bottom: 30px; }
  .brand { font-size: 28px; letter-spacing: 3px; color: #E07B2A; font-weight: bold; }
  .tagline { font-style: italic; color: #9A6E20; }
  .print-btn { background: linear-gradient(135deg, #E07B2A, #B85D10); color: white; border: none; padding: 12px 30px; font-size: 14px; cursor: pointer; margin: 20px auto; display: block; border-radius: 4px; }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">NAKSH369</div>
    <div class="tagline">Know Your Moment.®</div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">📥 Download as PDF (Print → Save as PDF)</button>
  ${html}
  <p style="text-align:center;margin-top:40px;color:#A0896A;font-size:12px;">© ${new Date().getFullYear()} NAKSH369 · WhatsApp: +91 83559 04017</p>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(fullHtml);
      win.document.close();
    }
  };

  const approve = async (id: string, action: string) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ readingId: id, action }),
    });
    const data = await res.json();
    if (data.success) { setActionMsg(data.message); loadDashboard(); setTimeout(() => setActionMsg(''), 3000); }
  };

  const generate = async (id: string) => {
    setGenerating(id);
    setActionMsg('⏳ Generating blueprint with Claude AI... please wait 30–60 seconds.');
    try {
      const res = await fetch('/api/readings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ readingId: id }),
      });
      const data = await res.json();
      if (data.success) { setActionMsg('✓ Blueprint generated and delivered to customer!'); loadDashboard(); }
      else setActionMsg('Error: ' + data.message);
    } finally { setGenerating(null); setTimeout(() => setActionMsg(''), 6000); }
  };

  const filtered = filter === 'all' ? readings : readings.filter(r => r.status === filter);

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--cream-2)', minHeight: '100vh', paddingBottom: '60px' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--teal-deep), var(--teal-darker))', padding: 'clamp(32px,5vw,56px) var(--pad)' }}>
          <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '8px' }}>ADMIN PORTAL</div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 300, fontSize: 'clamp(28px,4vw,44px)', color: 'var(--cream)', lineHeight: 1.1 }}>
              NAKSH<span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>369</span> Dashboard
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '32px var(--pad)' }}>
          {/* Stats */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              {[
                { label: 'Total Users', value: stats.total_users },
                { label: 'Total Readings', value: stats.total_readings },
                { label: 'Pending', value: stats.pending, highlight: stats.pending > 0 },
                { label: 'Payment Claimed', value: readings.filter((r:any) => r.status === 'payment_claimed').length, highlight: true },
                { label: 'Delivered', value: stats.delivered },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ background: 'var(--cream)', border: `1px solid ${highlight && value > 0 ? 'var(--saffron)' : 'var(--line)'}`, padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '32px', fontWeight: 300, color: highlight && value > 0 ? 'var(--saff-deep)' : 'var(--teal-deep)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--f-caps)', fontSize: '8px', letterSpacing: '2px', color: 'var(--gold-deep)', marginTop: '6px' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Message */}
          {actionMsg && (
            <div style={{ background: actionMsg.startsWith('Error') ? '#FEF0E7' : '#E8F5E9', border: `1px solid ${actionMsg.startsWith('Error') ? 'var(--saffron)' : '#4CAF50'}`, color: actionMsg.startsWith('Error') ? 'var(--saff-deep)' : '#2E7D32', fontFamily: 'var(--f-sans)', fontSize: '13px', padding: '12px 16px', marginBottom: '24px' }}>
              {actionMsg}
            </div>
          )}

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {['all', 'pending', 'payment_claimed', 'approved', 'processing', 'delivered'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '8px 14px', fontFamily: 'var(--f-caps)', fontSize: '8px', letterSpacing: '1.5px', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase', border: filter === f ? '1.5px solid var(--saffron)' : '1.5px solid var(--line)', background: filter === f ? 'var(--saff-soft)' : 'var(--cream)', color: filter === f ? 'var(--saff-deep)' : 'var(--warm-muted)' }}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Readings */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--warm-muted)' }}>Loading readings...</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', padding: '48px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '16px', color: 'var(--warm-mid)' }}>No readings in this category.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filtered.map((reading: any) => {
                const profile = reading.client_profiles;
                const userInfo = reading.user_info;
                const blueprint = reading.blueprints?.[0];
                const status = statusConfig[reading.status] || { label: reading.status, cls: 'badge-pending' };
                const isGen = generating === reading.id;

                return (
                  <div key={reading.id} style={{ background: 'var(--cream)', border: reading.status === 'payment_claimed' ? '1.5px solid var(--saffron)' : '1px solid var(--line)', padding: '24px', position: 'relative' }}>
                    {reading.status === 'payment_claimed' && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--saffron), var(--gold))' }} />
                    )}

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--f-caps)', fontSize: '13px', fontWeight: 600, color: 'var(--teal-deep)' }}>{profile?.first_name || userInfo?.first_name || 'Unknown'}</span>
                          <span className={`naksh-badge ${status.cls}`}>{status.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--f-sans)', fontSize: '11px', color: 'var(--warm-muted)' }}>{userInfo?.email}</div>
                        {userInfo?.whatsapp_number && <div style={{ fontFamily: 'var(--f-sans)', fontSize: '11px', color: 'var(--warm-muted)' }}>WhatsApp: {userInfo.whatsapp_number}</div>}
                      </div>
                      <div style={{ fontFamily: 'var(--f-sans)', fontSize: '11px', color: 'var(--warm-muted)' }}>{new Date(reading.created_at).toLocaleDateString('en-IN')}</div>
                    </div>

                    {/* Birth Data */}
                    {profile && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', padding: '14px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', marginBottom: '16px' }}>
                        {[
                          { label: 'DOB', value: profile.dob },
                          { label: 'Time', value: profile.birth_time || 'Unknown' },
                          { label: 'Place', value: profile.birth_place },
                          { label: 'Gender', value: profile.gender },
                          { label: 'Life Path', value: profile.life_path_number, big: true },
                          { label: 'Personal Year', value: profile.personal_year, big: true },
                        ].map(({ label, value, big }) => (
                          <div key={label}>
                            <div style={{ fontFamily: 'var(--f-caps)', fontSize: '8px', letterSpacing: '1.5px', color: 'var(--gold-deep)', marginBottom: '4px' }}>{label}</div>
                            <div style={{ fontFamily: big ? 'var(--f-display)' : 'var(--f-sans)', fontSize: big ? '24px' : '12px', fontWeight: big ? 300 : 400, color: big ? 'var(--saff-deep)' : 'var(--warm-dark)', fontStyle: big ? 'italic' : 'normal', textTransform: 'capitalize' }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Questions */}
                    {reading.questions && (
                      <div style={{ background: 'var(--cream-2)', border: '1px solid var(--line-soft)', padding: '12px 16px', marginBottom: '16px' }}>
                        <div style={{ fontFamily: 'var(--f-caps)', fontSize: '8px', letterSpacing: '2px', color: 'var(--gold-deep)', marginBottom: '6px' }}>CLIENT QUESTIONS</div>
                        <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '13px', color: 'var(--warm-mid)', lineHeight: 1.6 }}>{reading.questions}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {(reading.status === 'pending' || reading.status === 'payment_claimed') && (
                        <>
                          <button onClick={() => approve(reading.id, 'approve')} className="btn-naksh btn-saffron" style={{ fontSize: '9px', padding: '10px 18px' }}>
                            {reading.status === 'payment_claimed' ? '✓ Verify & Approve' : 'Approve'}
                          </button>
                          <button onClick={() => approve(reading.id, 'reject')} style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '1.5px', padding: '10px 18px', background: 'transparent', border: '1px solid #EF5350', color: '#B71C1C', cursor: 'pointer' }}>
                            Reject
                          </button>
                        </>
                      )}
                      {reading.status === 'approved' && (
                        <button onClick={() => generate(reading.id)} disabled={isGen} className="btn-naksh btn-saffron" style={{ fontSize: '9px', padding: '10px 20px' }}>
                          {isGen ? '⏳ Generating...' : '✦ Generate & Deliver Blueprint'}
                        </button>
                      )}
                      {reading.status === 'delivered' && (
                        <>
                          {blueprint?.content_html && (
                            <button onClick={() => viewReport(blueprint.content_html, profile?.first_name || 'Client')} className="btn-naksh btn-saffron" style={{ fontSize: '9px', padding: '10px 18px' }}>📄 View / Download Report</button>
                          )}
                          {blueprint?.pdf_url && (
                            <a href={blueprint.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-naksh btn-outline-teal" style={{ fontSize: '9px', padding: '10px 18px' }}>View PDF ↗</a>
                          )}
                          <button onClick={() => generate(reading.id)} disabled={isGen} style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '1.5px', padding: '10px 18px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--warm-muted)', cursor: 'pointer' }}>
                            {isGen ? 'Generating...' : 'Regenerate'}
                          </button>
                        </>
                      )}
                    </div>
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
