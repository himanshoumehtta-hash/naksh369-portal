'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const readingId = searchParams.get('readingId');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [activeQR, setActiveQR] = useState<'paytm' | 'phonepe'>('paytm');

  useEffect(() => {
    const t = localStorage.getItem('naksh_token');
    const user = JSON.parse(localStorage.getItem('naksh_user') || '{}');
    if (!t) { router.push('/auth/login'); return; }
    setToken(t);
    if (user.first_name) setName(user.first_name);
  }, [router]);

  const handlePaymentDone = async () => {
    setLoading(true);
    try {
      await fetch('/api/payment/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ readingId, name }),
      });
      setSubmitted(true);
    } catch { setSubmitted(true); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div style={{ background: 'var(--cream-2)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--f-dev)', fontSize: '48px', color: 'var(--saff-deep)', marginBottom: '20px' }}>🙏</div>
        <h1 className="naksh-sec-h" style={{ marginBottom: '24px' }}>Payment <em>Received</em></h1>
        <div className="naksh-card" style={{ marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ fontFamily: 'var(--f-display)', fontSize: '16px', color: 'var(--warm-mid)', lineHeight: 1.7 }}>
            Thank you, <strong style={{ color: 'var(--teal-deep)' }}>{name}</strong>. Your payment has been notified to NAKSH369.
          </p>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: '13px', color: 'var(--warm-muted)', marginTop: '12px' }}>
            Your Life Blueprint will be delivered to your email within <strong style={{ color: 'var(--saff-deep)' }}>24–48 hours</strong> after verification.
          </p>
        </div>
        <a href="/dashboard" className="btn-naksh btn-saffron">View Dashboard →</a>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--cream-2)', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="naksh-page" style={{ maxWidth: '580px' }}>
        <div style={{ padding: 'clamp(32px,5vw,60px) 0 32px' }}>
          <div className="naksh-sec-label">Secure Payment</div>
          <h1 className="naksh-sec-h">Complete Your <em>Reading</em></h1>
          <p className="naksh-sec-sub">Scan the QR code below to pay via any UPI app</p>
        </div>

        {/* Amount */}
        <div style={{ background: 'linear-gradient(135deg, var(--teal-deep), var(--teal-darker))', padding: '24px', marginBottom: '20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '3px', color: 'rgba(253,248,239,0.65)', marginBottom: '8px' }}>AMOUNT TO PAY</div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: '60px', fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>₹999</div>
          <div style={{ fontFamily: 'var(--f-sans)', fontSize: '12px', color: 'rgba(253,248,239,0.65)', marginTop: '8px' }}>Life Blueprint — Full Reading</div>
        </div>

        {/* QR Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['paytm', 'phonepe'] as const).map(qr => (
            <button key={qr} onClick={() => setActiveQR(qr)}
              style={{ flex: 1, padding: '10px', fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s', border: activeQR === qr ? '1.5px solid var(--saffron)' : '1.5px solid var(--line)', background: activeQR === qr ? 'var(--saff-soft)' : 'var(--cream)', color: activeQR === qr ? 'var(--saff-deep)' : 'var(--warm-muted)' }}>
              {qr === 'paytm' ? 'PAYTM QR' : 'PHONEPE QR'}
            </button>
          ))}
        </div>

        {/* QR Card */}
        <div className="naksh-card" style={{ marginBottom: '20px' }}>
          <div style={{ background: 'white', borderRadius: '4px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--f-sans)', fontSize: '10px', color: '#666', marginBottom: '12px', letterSpacing: '1px' }}>
              {activeQR === 'paytm' ? 'PAYTM · GPAY · BHIM · ALL UPI APPS' : 'PHONEPE APP'}
            </div>
            <img src={activeQR === 'paytm' ? '/paytm-qr.jpg' : '/phonepe-qr.jpg'}
              alt={`${activeQR} QR Code`}
              style={{ width: '200px', height: '200px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            <div style={{ fontFamily: 'var(--f-caps)', fontSize: '11px', color: 'var(--teal-deep)', marginTop: '12px', letterSpacing: '1px' }}>HIMANSHOU MEHTTA</div>
          </div>

          <div style={{ background: 'var(--cream-2)', border: '1px solid var(--line-soft)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-caps)', fontSize: '8px', letterSpacing: '2px', color: 'var(--gold-deep)', marginBottom: '8px' }}>UPI ID — COPY & PAY</div>
            <div style={{ fontFamily: 'monospace', fontSize: '18px', color: 'var(--teal-deep)', fontWeight: 600, letterSpacing: '1px' }}>9167090026@ptsbi</div>
            <div style={{ fontFamily: 'var(--f-sans)', fontSize: '11px', color: 'var(--warm-muted)', marginTop: '4px' }}>Works on all UPI apps</div>
          </div>
        </div>

        {/* Steps */}
        <div className="naksh-card" style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--f-caps)', fontSize: '9px', letterSpacing: '3px', color: 'var(--gold-deep)', marginBottom: '16px' }}>HOW TO PAY</div>
          {[
            'Open PhonePe, GPay, Paytm or BHIM',
            'Tap the QR tab above for your preferred app',
            'Scan QR code OR enter UPI ID manually',
            'Enter amount ₹999 and complete payment',
            'Click the button below to confirm',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--saff-soft)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '14px', color: 'var(--saff-deep)' }}>{i + 1}</div>
              <p style={{ fontFamily: 'var(--f-sans)', fontSize: '13px', color: 'var(--warm-mid)', lineHeight: 1.5, marginTop: '2px' }}>{step}</p>
            </div>
          ))}
        </div>

        <button onClick={handlePaymentDone} disabled={loading} className="btn-naksh btn-saffron btn-full" style={{ fontSize: '12px', padding: '16px' }}>
          {loading ? 'Notifying NAKSH369...' : '✓ I Have Paid ₹999'}
        </button>
        <p style={{ textAlign: 'center', fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '12px', color: 'var(--warm-muted)', marginTop: '12px', lineHeight: 1.5 }}>
          Blueprint delivered within 24–48 hours after payment verification<br />
          Questions? <a href="https://wa.me/918355904017" style={{ color: 'var(--saff-deep)' }}>WhatsApp: +91 83559 04017</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream-2)' }}><p style={{ fontFamily: 'var(--f-display)', color: 'var(--warm-muted)' }}>Loading payment...</p></div>}>
        <PaymentContent />
      </Suspense>
      <Footer />
    </>
  );
}
