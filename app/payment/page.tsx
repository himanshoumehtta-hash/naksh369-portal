'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ readingId, name }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-3xl font-serif text-white mb-4">Payment Received!</h1>
          <div className="card-cosmic mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              Thank you, <span className="text-gold-400">{name}</span>. Your payment has been notified to NAKSH369.
            </p>
            <p className="text-gray-400 text-sm mt-3">
              Your Life Blueprint will be delivered to your email within <span className="text-gold-400">24–48 hours</span>.
            </p>
          </div>
          <Link href="/dashboard" className="btn-gold inline-block">View Dashboard →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-gold-400 tracking-[0.3em] font-bold text-lg">NAKSH369</Link>
          <h1 className="text-2xl font-serif text-white mt-4 mb-2">Complete Your Payment</h1>
          <p className="text-gray-500 text-sm">Scan the QR code to pay via any UPI app</p>
        </div>

        {/* Amount */}
        <div className="card-cosmic text-center mb-6">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Amount to Pay</p>
          <p className="text-gold-400 text-5xl font-serif font-light">₹999</p>
          <p className="text-gray-500 text-sm mt-2">Life Blueprint — Full Reading</p>
        </div>

        {/* QR Toggle Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveQR('paytm')}
            className={`flex-1 py-2.5 text-xs font-medium rounded-sm border transition-colors ${
              activeQR === 'paytm'
                ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                : 'border-cosmic-700 text-gray-500 hover:border-gold-500/40'
            }`}
          >
            Paytm QR
          </button>
          <button
            onClick={() => setActiveQR('phonepe')}
            className={`flex-1 py-2.5 text-xs font-medium rounded-sm border transition-colors ${
              activeQR === 'phonepe'
                ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                : 'border-cosmic-700 text-gray-500 hover:border-gold-500/40'
            }`}
          >
            PhonePe QR
          </button>
        </div>

        {/* QR Code */}
        <div className="card-cosmic mb-6">
          <p className="text-center text-gray-400 text-xs uppercase tracking-widest mb-4">
            {activeQR === 'paytm' ? 'Scan with Paytm · GPay · BHIM' : 'Scan with PhonePe App'}
          </p>
          <div className="bg-white rounded-lg p-4 mb-4 text-center">
            {activeQR === 'paytm' ? (
              <img
                src="/paytm-qr.jpg"
                alt="Paytm UPI QR Code"
                className="w-52 h-52 mx-auto object-contain"
              />
            ) : (
              <img
                src="/phonepe-qr.jpg"
                alt="PhonePe QR Code"
                className="w-52 h-52 mx-auto object-contain"
              />
            )}
            <p className="text-xs font-bold text-gray-800 mt-3">HIMANSHOU MEHTTA</p>
          </div>

          {/* UPI ID */}
          <div className="bg-cosmic-700/40 rounded-sm p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">UPI ID</p>
            <p className="text-gold-400 text-xl font-mono tracking-wide">9167090026@ptsbi</p>
            <p className="text-gray-500 text-xs mt-1">Copy and pay on any UPI app</p>
          </div>
        </div>

        {/* Steps */}
        <div className="card-cosmic mb-6">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">How to Pay</p>
          {[
            ['1', 'Open PhonePe, GPay, Paytm or BHIM'],
            ['2', 'Tap the QR tab above for your preferred app'],
            ['3', 'Scan QR code OR enter UPI ID manually'],
            ['4', 'Enter amount: ₹999 and complete payment'],
            ['5', 'Click "I Have Paid" below'],
          ].map(([num, text]) => (
            <div key={num} className="flex gap-3 items-start mb-3">
              <div className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-gold-400 text-xs">{num}</span>
              </div>
              <p className="text-gray-300 text-sm">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handlePaymentDone}
          disabled={loading}
          className="btn-gold w-full py-4 text-base"
        >
          {loading ? 'Notifying NAKSH369...' : '✅ I Have Paid ₹999'}
        </button>

        <p className="text-center text-gray-600 text-xs mt-4">
          Blueprint delivered within 24–48 hours after payment verification
        </p>

        <div className="section-divider" />

        <p className="text-center text-gray-600 text-xs">
          Questions? WhatsApp: <span className="text-gold-500">+91 83559 04017</span>
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading payment...</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
