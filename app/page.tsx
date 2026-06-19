'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const thresholdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Threshold logic
    const threshold = thresholdRef.current;
    if (!threshold) return;
    let hasVisited = false;
    try { hasVisited = localStorage.getItem('naksh_threshold_seen') === 'true'; } catch(e) {}
    if (hasVisited) {
      threshold.style.display = 'none';
      document.body.classList.remove('threshold-active');
    } else {
      document.body.classList.add('threshold-active');
      setTimeout(() => enterThreshold(), 5000);
    }

    // Reveal on scroll
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.transitionDelay = (i * 0.05) + 's';
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function enterThreshold(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const t = thresholdRef.current;
    if (!t || t.classList.contains('exiting')) return;
    t.classList.add('exiting');
    document.body.classList.remove('threshold-active');
    try { localStorage.setItem('naksh_threshold_seen', 'true'); } catch(e) {}
    setTimeout(() => { if (t) t.style.display = 'none'; }, 1200);
  }

  function ringBell(e: React.MouseEvent) {
    e.stopPropagation();
    const bell = document.getElementById('bellBtn');
    if (bell) {
      bell.classList.remove('ringing');
      void (bell as HTMLElement).offsetWidth;
      bell.classList.add('ringing');
    }
    try {
      const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      [528, 792, 1056].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2 / (i + 1), now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch(e) {}
  }

  function submitAsk() {
    const name = (document.getElementById('ak_name') as HTMLInputElement)?.value.trim();
    const dob = (document.getElementById('ak_dob') as HTMLInputElement)?.value;
    const tob = (document.getElementById('ak_tob') as HTMLInputElement)?.value;
    const pob = (document.getElementById('ak_pob') as HTMLInputElement)?.value.trim();
    const area = (document.getElementById('ak_area') as HTMLSelectElement)?.value;
    const q = (document.getElementById('ak_q') as HTMLTextAreaElement)?.value.trim();
    if (!name || !dob || !tob || !pob || !q) { alert('Please complete all fields.'); return; }
    if (q.length < 15) { alert('Please write a more specific question (15+ chars).'); return; }
    const [y, m, d] = dob.split('-');
    const labels: Record<string, string> = { career: 'Career', business: 'Business', money: 'Money', marriage: 'Marriage', family: 'Family', health: 'Health', travel: 'Travel', education: 'Education', spiritual: 'Spiritual' };
    const msg = `*NAKSH369 · Ask · ₹99 / $5*\n\n*Name:* ${name}\n*DOB:* ${d}/${m}/${y}\n*Time:* ${tob}\n*Place:* ${pob}\n*Area:* ${labels[area]}\n\n*Question:*\n${q}\n\nPlease share payment link.\n\n— naksh369.com`;
    window.open(`https://wa.me/918355904017?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <>
      <style>{`
        @keyframes slowSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .spin-slow{animation:slowSpin 240s linear infinite;transform-origin:center;}
        .spin-slower{animation:slowSpin 360s linear infinite reverse;transform-origin:center;}
        .spin-slowest{animation:slowSpin 480s linear infinite;transform-origin:center;}
        @keyframes breathe{0%,100%{transform:scale(1);}50%{transform:scale(1.05);}}
        @keyframes slowSpinThr{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .threshold-mandala{position:absolute;width:90vmin;height:90vmin;opacity:0.18;animation:breathe 8s ease-in-out infinite,slowSpinThr 180s linear infinite;pointer-events:none;}
        @keyframes pulseGlow{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.15);opacity:1;}}
        .threshold-glow{position:absolute;width:62vmin;height:62vmin;border-radius:50%;background:radial-gradient(circle,rgba(255,248,220,0.75) 0%,rgba(245,220,138,0.35) 30%,rgba(212,166,52,0.1) 60%,transparent 80%);animation:pulseGlow 6s ease-in-out infinite;pointer-events:none;}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
        .threshold-diya{position:relative;z-index:5;animation:fadeInUp 1.6s ease-out 0.3s both;margin-bottom:32px;}
        @keyframes flicker{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.012);opacity:0.96;}}
        .flame{transform-origin:center bottom;animation:flicker 7s ease-in-out infinite;}
        @keyframes fadeIn{to{opacity:1;}}
        .threshold-sanskrit{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(24px,4vw,40px);color:#5B2B05;text-align:center;margin-bottom:10px;letter-spacing:1.2px;line-height:1.3;opacity:0;animation:fadeIn 1.5s ease-out 1.2s forwards;text-shadow:0 1px 2px rgba(255,240,200,0.8);position:relative;z-index:5;}
        .threshold-translit{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(22px,3.5vw,36px);color:#5B2B05;text-align:center;margin-bottom:48px;letter-spacing:1.2px;line-height:1.3;opacity:0;animation:fadeIn 1.5s ease-out 2s forwards;position:relative;z-index:5;}
        .threshold-brand{font-family:'Cinzel',serif;font-size:clamp(28px,5vw,48px);font-weight:600;letter-spacing:6px;color:#5B2B05;margin-bottom:8px;opacity:0;animation:fadeIn 1.5s ease-out 2.6s forwards;position:relative;z-index:5;text-shadow:0 2px 4px rgba(255,255,255,0.5);}
        .threshold-tag{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(14px,2vw,18px);color:#7A3F0E;letter-spacing:2px;opacity:0;animation:fadeIn 1.5s ease-out 3.2s forwards;position:relative;z-index:5;margin-bottom:48px;}
        @keyframes gentlePulse{0%,100%{box-shadow:0 0 0 0 rgba(91,43,5,0.2);}50%{box-shadow:0 0 0 12px rgba(91,43,5,0);}}
        .threshold-enter{background:rgba(91,43,5,0.08);border:1.5px solid rgba(91,43,5,0.3);color:#5B2B05;padding:14px 36px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;cursor:pointer;transition:all 0.3s;opacity:0;animation:fadeIn 1.5s ease-out 3.8s forwards,gentlePulse 3s ease-in-out 5.3s infinite;position:relative;z-index:5;backdrop-filter:blur(4px);}
        .threshold-enter:hover{background:rgba(91,43,5,0.18);transform:translateY(-2px);}
        .threshold-bell{position:absolute;bottom:48px;right:48px;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.25);border:1px solid rgba(91,43,5,0.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s;opacity:0;animation:fadeIn 1.5s ease-out 4.4s forwards;z-index:6;}
        .threshold-skip{position:absolute;top:24px;right:24px;font-family:'Raleway',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(91,43,5,0.6);cursor:pointer;background:none;border:none;opacity:0;animation:fadeIn 1.5s ease-out 4.4s forwards;z-index:6;}
        @keyframes bellRing{0%,100%{transform:rotate(0);}20%{transform:rotate(-15deg);}40%{transform:rotate(12deg);}60%{transform:rotate(-8deg);}80%{transform:rotate(5deg);}}
        .ringing{animation:bellRing 0.6s ease-out!important;}
        .threshold.exiting{opacity:0;visibility:hidden;}
        body.threshold-active{overflow:hidden;}
        @keyframes pulse-dot{0%,100%{opacity:0.5;transform:scale(1);}50%{opacity:1;transform:scale(1.4);}}
        .hero-globe{position:absolute;right:-180px;top:50%;transform:translateY(-50%);width:720px;height:720px;pointer-events:none;opacity:0.85;z-index:1;}
        @media(max-width:1024px){.hero-globe{right:-280px;width:560px;height:560px;opacity:0.4;}}
        @media(max-width:640px){.hero-globe{right:-360px;opacity:0.25;}}
        .reveal{opacity:0;transform:translateY(14px);transition:opacity 0.7s cubic-bezier(0.2,0.8,0.2,1),transform 0.7s cubic-bezier(0.2,0.8,0.2,1);}
        .reveal.in{opacity:1;transform:translateY(0);}
        .tcard{transition:border-color 0.25s,transform 0.25s;}
        .tcard:hover{border-color:var(--gold);transform:translateY(-2px);}
        .lever:hover{border-color:var(--saffron);transform:translateY(-3px);}
        .price-card:hover{background:var(--cream-2);}
        .price-card.feat:hover{background:linear-gradient(180deg,var(--teal) 0%,var(--teal-deep) 100%);}
      `}</style>

      {/* THRESHOLD */}
      <div ref={thresholdRef} id="threshold" onClick={enterThreshold} style={{ position:'fixed',inset:0,zIndex:10000,background:'radial-gradient(ellipse at center,#FFFAEC 0%,#F8E8C0 30%,#E8C880 65%,#B08440 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden',transition:'opacity 1.2s cubic-bezier(0.4,0,0.2,1),visibility 1.2s',cursor:'pointer' }}>
        <button className="threshold-skip" onClick={enterThreshold}>Skip →</button>
        <svg className="threshold-mandala" viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="280" stroke="#5B2B05" strokeWidth="1" fill="none"/>
          <circle cx="300" cy="300" r="240" stroke="#5B2B05" strokeWidth="0.6" fill="none"/>
          <circle cx="300" cy="300" r="200" stroke="#5B2B05" strokeWidth="1" fill="none"/>
          <circle cx="300" cy="300" r="140" stroke="#5B2B05" strokeWidth="0.8" fill="none"/>
          <polygon points="300,80 480,360 120,360" stroke="#5B2B05" strokeWidth="0.8" fill="none"/>
          <polygon points="300,520 480,240 120,240" stroke="#5B2B05" strokeWidth="0.8" fill="none"/>
          <circle cx="300" cy="300" r="60" stroke="#5B2B05" strokeWidth="0.8" fill="none"/>
        </svg>
        <div className="threshold-glow"/>
        <div className="threshold-diya">
          <svg width="200" height="240" viewBox="0 0 240 280" fill="none">
            <defs>
              <linearGradient id="royalGold" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#F5E5A0"/><stop offset="40%" stopColor="#D4A634"/><stop offset="100%" stopColor="#8B6914"/></linearGradient>
              <radialGradient id="royalAura" cx="50%" cy="40%" r="65%"><stop offset="0%" stopColor="#FFFAEC" stopOpacity="0.92"/><stop offset="40%" stopColor="#F5E0B0" stopOpacity="0.5"/><stop offset="100%" stopColor="#C9A04A" stopOpacity="0"/></radialGradient>
            </defs>
            <circle cx="120" cy="130" r="115" fill="url(#royalAura)" className="flame"/>
            <circle cx="120" cy="130" r="108" stroke="#D4A634" strokeWidth="0.4" fill="none" opacity="0.5"/>
            <g stroke="url(#royalGold)" fill="none" strokeLinecap="round">
              <path d="M 120 240 Q 100 248 80 254 Q 68 256 60 254" strokeWidth="2"/>
              <path d="M 120 240 Q 140 248 160 254 Q 172 256 180 254" strokeWidth="2"/>
              <path d="M 120 240 Q 117 254 113 268" strokeWidth="1.5"/>
              <path d="M 120 240 Q 123 254 127 268" strokeWidth="1.5"/>
            </g>
            <path d="M 116 240 Q 117 200 118 160 Q 119 130 120 110 Q 121 130 122 160 Q 123 200 124 240 Z" fill="url(#royalGold)"/>
            <g stroke="url(#royalGold)" fill="none" strokeLinecap="round">
              <path d="M 120 165 Q 100 158 80 145 Q 68 138 62 130" strokeWidth="2.2"/>
              <path d="M 120 165 Q 140 158 160 145 Q 172 138 178 130" strokeWidth="2.2"/>
              <path d="M 120 120 Q 108 108 100 92 Q 96 82 98 74" strokeWidth="1.8"/>
              <path d="M 120 120 Q 132 108 140 92 Q 144 82 142 74" strokeWidth="1.8"/>
              <path d="M 120 105 Q 120 80 120 60" strokeWidth="1.5"/>
            </g>
            <g className="flame">
              <circle cx="62" cy="135" r="5" fill="#D4A634"/><circle cx="178" cy="135" r="5" fill="#D4A634"/>
              <circle cx="100" cy="95" r="4" fill="#D4A634"/><circle cx="140" cy="95" r="4" fill="#D4A634"/>
              <circle cx="120" cy="62" r="5" fill="#D4A634"/>
            </g>
          </svg>
        </div>
        <div className="threshold-sanskrit">What you came here to find</div>
        <div className="threshold-translit">was already waiting for you.</div>
        <div className="threshold-brand">NAKSH<span style={{color:'#9A4A0A'}}>369</span></div>
        <div className="threshold-tag">Know Your Moment.®</div>
        <button className="threshold-enter" onClick={enterThreshold}>Enter ✦</button>
        <button id="bellBtn" className="threshold-bell" onClick={ringBell}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2 L12 4 M6 8 Q6 4 12 4 Q18 4 18 8 L18 14 L20 17 L4 17 L6 14 Z" stroke="#5B2B05" strokeWidth="1.5" fill="rgba(255,240,200,0.4)"/><path d="M10 18 Q10 20 12 20 Q14 20 14 18" stroke="#5B2B05" strokeWidth="1.5" fill="none"/></svg>
        </button>
      </div>

      {/* LEGAL BAR */}
      <div style={{position:'sticky',top:0,zIndex:100,background:'linear-gradient(90deg,var(--teal-deep) 0%,var(--teal) 100%)',color:'var(--cream)',padding:'8px var(--pad)',borderBottom:'1px solid var(--gold)'}}>
        <div style={{maxWidth:'var(--max)',margin:'0 auto',display:'flex',justifyContent:'center',alignItems:'center',gap:'clamp(12px,2vw,32px)',flexWrap:'wrap',fontFamily:'var(--f-sans)',fontSize:'11px',letterSpacing:'1px'}}>
          <span>⚖️ <a href="#legal" style={{color:'var(--gold-pale)',textDecoration:'none',fontWeight:500}}>Disclaimers</a></span>
          <span style={{opacity:0.4}}>·</span>
          <span>💸 <a href="#refund" style={{color:'var(--gold-pale)',textDecoration:'none',fontWeight:500}}>7-Day Refund</a></span>
          <span style={{opacity:0.4}}>·</span>
          <span>🔒 <a href="#privacy" style={{color:'var(--gold-pale)',textDecoration:'none',fontWeight:500}}>DPDP 2023</a></span>
          <span style={{opacity:0.4}}>·</span>
          <span>📞 <a href="https://wa.me/918355904017" style={{color:'var(--gold-pale)',textDecoration:'none',fontWeight:500}}>+91 83559 04017</a></span>
        </div>
      </div>

      {/* DEVOTIONAL STRIP */}
      <div style={{background:'linear-gradient(135deg,var(--saff-deep) 0%,var(--saffron) 50%,var(--saff-deep) 100%)',padding:'14px var(--pad)',position:'relative',overflow:'hidden'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',gap:'clamp(16px,3vw,40px)',flexWrap:'wrap',position:'relative',zIndex:1}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
            <div style={{fontFamily:'var(--f-dev)',fontSize:'24px',color:'rgba(255,255,255,0.9)'}}>🐘</div>
            <span style={{fontFamily:'var(--f-dev)',fontSize:'11px',color:'rgba(255,255,255,0.95)'}}>॥ श्री गणेशाय नमः ॥</span>
          </div>
          <div style={{fontFamily:'var(--f-dev)',fontSize:'32px',color:'rgba(255,255,255,0.92)',textShadow:'0 0 16px rgba(255,255,255,0.4)'}}>ॐ</div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
            <div style={{fontFamily:'var(--f-dev)',fontSize:'24px',color:'rgba(255,255,255,0.9)'}}>🙏</div>
            <span style={{fontFamily:'var(--f-dev)',fontSize:'11px',color:'rgba(255,255,255,0.95)'}}>॥ जय श्री हनुमान ॥</span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav style={{background:'rgba(253,248,239,0.96)',borderBottom:'1px solid var(--line)',padding:'18px var(--pad)',position:'sticky',top:'76px',zIndex:90,backdropFilter:'blur(16px)'}}>
        <div style={{maxWidth:'var(--max)',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="#" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'42px',height:'42px',borderRadius:'50%',border:'1.5px solid var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(circle,var(--saff-soft) 0%,var(--cream) 100%)'}}>
              <svg width="22" height="22" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="22" stroke="#C9A84C" strokeWidth="1.4" fill="none"/><circle cx="30" cy="30" r="13" stroke="#1A6E78" strokeWidth="1" fill="none"/><circle cx="30" cy="18" r="2.5" fill="#E07B2A"/><circle cx="30" cy="30" r="1.5" fill="#C9A84C"/></svg>
            </div>
            <div>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'22px',fontWeight:600,letterSpacing:'1.2px',color:'var(--teal-deep)',lineHeight:1}}>NAKSH<span style={{color:'var(--saffron)'}}>369</span><sup style={{fontSize:'9px',color:'var(--gold)',verticalAlign:'super'}}>®</sup></div>
              <div style={{fontFamily:'var(--f-sans)',fontSize:'9px',letterSpacing:'2.5px',textTransform:'uppercase',color:'var(--gold-deep)',marginTop:'3px'}}>Know Your Moment.®</div>
            </div>
          </a>
          <div style={{display:'flex',alignItems:'center',gap:'clamp(14px,2.5vw,30px)'}}>
            <a href="#framework" style={{fontFamily:'var(--f-sans)',fontSize:'12px',fontWeight:500,letterSpacing:'1.5px',textTransform:'uppercase',textDecoration:'none',color:'var(--teal-deep)'}}>Framework</a>
            <a href="#blueprint" style={{fontFamily:'var(--f-sans)',fontSize:'12px',fontWeight:500,letterSpacing:'1.5px',textTransform:'uppercase',textDecoration:'none',color:'var(--teal-deep)'}}>Blueprint</a>
            <a href="#readings" style={{fontFamily:'var(--f-sans)',fontSize:'12px',fontWeight:500,letterSpacing:'1.5px',textTransform:'uppercase',textDecoration:'none',color:'var(--teal-deep)'}}>Readings</a>
            <Link href="/auth/signup" style={{background:'linear-gradient(135deg,var(--saffron),var(--saff-deep))',color:'var(--cream)',padding:'11px 22px',fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'2px',textDecoration:'none',boxShadow:'0 2px 12px rgba(184,93,16,0.3)'}}>Begin Reading →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:'relative',overflow:'hidden',padding:'clamp(56px,8vh,96px) var(--pad) clamp(64px,10vh,120px)',background:'linear-gradient(180deg,var(--cream) 0%,var(--cream-2) 100%)'}}>
        <div className="hero-globe" aria-hidden="true">
          <svg viewBox="0 0 720 720" fill="none">
            <g className="spin-slow">
              <circle cx="360" cy="360" r="340" stroke="#C9A84C" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <circle cx="360" cy="360" r="300" stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.4"/>
              <g stroke="#B85D10" strokeWidth="1.2">
                {Array.from({length:27},(_,i)=><line key={i} x1="360" y1="20" x2="360" y2="40" transform={`rotate(${i*13.33} 360 360)`}/>)}
              </g>
            </g>
            <g className="spin-slower">
              <polygon points="360,140 530,440 190,440" stroke="#0D4A52" strokeWidth="1.3" fill="none" opacity="0.7"/>
              <polygon points="360,580 530,280 190,280" stroke="#0D4A52" strokeWidth="1.3" fill="none" opacity="0.7"/>
            </g>
            <g className="spin-slowest">
              <circle cx="360" cy="360" r="160" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.6"/>
              <circle cx="360" cy="200" r="6" fill="#E07B2A"/>
              <circle cx="473" cy="248" r="5" fill="#C9A84C"/>
              <circle cx="520" cy="360" r="6" fill="#B85D10"/>
              <circle cx="473" cy="473" r="5" fill="#9A6E20"/>
              <circle cx="360" cy="520" r="6" fill="#1A6E78"/>
              <circle cx="248" cy="473" r="5" fill="#C9A84C"/>
              <circle cx="200" cy="360" r="6" fill="#E07B2A"/>
              <circle cx="248" cy="248" r="5" fill="#9A6E20"/>
            </g>
            <circle cx="360" cy="360" r="80" fill="#FDF8EF" opacity="0.8"/>
            <circle cx="360" cy="360" r="80" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
            <text x="360" y="385" fontFamily="Tiro Devanagari Sanskrit,serif" fontSize="64" fill="#B85D10" textAnchor="middle">ॐ</text>
          </svg>
        </div>
        <div style={{maxWidth:'var(--max)',margin:'0 auto',position:'relative',zIndex:2}}>
          <div className="reveal" style={{display:'inline-flex',alignItems:'center',gap:'10px',background:'var(--saff-soft)',border:'1px solid var(--gold)',padding:'7px 16px',borderRadius:'100px',marginBottom:'24px'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--saffron)',display:'inline-block'}}/>
            <span style={{fontFamily:'var(--f-sans)',fontSize:'10px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--saff-deep)'}}>Personal Blueprint Platform · Not Another Astrology App</span>
          </div>
          <h1 className="reveal" style={{fontFamily:'var(--f-display)',fontWeight:300,fontSize:'clamp(48px,7vw,100px)',lineHeight:0.96,letterSpacing:'-0.02em',color:'var(--teal-deep)',marginBottom:'24px',maxWidth:'780px'}}>
            <span style={{fontStyle:'italic',color:'var(--saff-deep)'}}>Know</span>
            <span style={{display:'block',background:'linear-gradient(135deg,var(--gold-deep),var(--saffron))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Your Moment.®</span>
          </h1>
          <p className="reveal" style={{fontFamily:'var(--f-display)',fontSize:'clamp(17px,2vw,22px)',fontWeight:300,lineHeight:1.5,color:'var(--warm-mid)',maxWidth:'560px',marginBottom:'32px'}}>
            Your birth chart decoded into a <strong style={{fontWeight:500,color:'var(--teal-deep)',fontStyle:'italic'}}>living manual</strong> — through verified Vedic charts, KP system, and the <strong style={{fontWeight:500,color:'var(--teal-deep)',fontStyle:'italic'}}>NAKSH Activation Framework™</strong>.
          </p>
          <div className="reveal" style={{display:'flex',gap:'14px',flexWrap:'wrap',marginBottom:'28px'}}>
            <Link href="/auth/signup" style={{display:'inline-flex',alignItems:'center',gap:'10px',fontFamily:'var(--f-caps)',fontSize:'11px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',padding:'14px 28px',textDecoration:'none',background:'linear-gradient(135deg,var(--saffron) 0%,var(--saff-deep) 100%)',color:'var(--cream)',boxShadow:'0 4px 18px rgba(184,93,16,0.32)'}}>
              Begin Your Reading · ₹999 →
            </Link>
            <a href="#framework" style={{display:'inline-flex',alignItems:'center',gap:'10px',fontFamily:'var(--f-caps)',fontSize:'11px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',padding:'14px 28px',textDecoration:'none',background:'transparent',color:'var(--teal-deep)',border:'1.5px solid var(--gold)'}}>
              See the Framework
            </a>
          </div>
          <div className="reveal" style={{display:'flex',gap:'clamp(12px,2vw,24px)',flexWrap:'wrap'}}>
            {['Verified Charts','Activation Framework™','7-Day Refund','Mumbai · Worldwide'].map(t=>(
              <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'6px',fontFamily:'var(--f-sans)',fontSize:'10px',fontWeight:500,letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--warm-muted)'}}>
                <span style={{color:'var(--gold)',fontSize:'8px'}}>✦</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section style={{padding:'clamp(56px,8vw,108px) var(--pad)',background:'linear-gradient(180deg,var(--cream-3) 0%,var(--cream-2) 100%)',borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)'}} id="framework">
        <div style={{maxWidth:'var(--max)',margin:'0 auto'}}>
          <div style={{display:'inline-block',background:'var(--saff-soft)',border:'1px solid var(--gold)',padding:'6px 16px',borderRadius:'100px',fontFamily:'var(--f-caps)',fontSize:'10px',letterSpacing:'3px',color:'var(--saff-deep)',marginBottom:'16px'}}>PROPRIETARY SYSTEM</div>
          <h2 className="reveal" style={{fontFamily:'var(--f-display)',fontWeight:300,fontSize:'clamp(30px,4vw,52px)',lineHeight:1.1,letterSpacing:'-0.02em',color:'var(--teal-deep)'}}>The NAKSH <em style={{fontStyle:'italic',color:'var(--saff-deep)'}}>Activation Framework™</em></h2>
          <div className="reveal" style={{background:'var(--cream)',borderLeft:'3px solid var(--saffron)',padding:'24px 32px',margin:'32px 0 40px',fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'clamp(17px,2vw,21px)',lineHeight:1.5,color:'var(--warm-dark)',maxWidth:'920px'}}>
            A structured system that converts your birth chart into <em style={{fontStyle:'normal',color:'var(--saff-deep)',fontWeight:500}}>precise, actionable interventions</em> — designed to shift outcomes, not just explain them.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0,border:'1px solid var(--line)',background:'var(--cream)'}}>
            {[['STEP I','Diagnose','Identify what is misaligned. Your chart reveals the planetary configurations behind the patterns you experience.'],['STEP II','Prescribe','Design what needs to be done. Drawing from your dasha, transits, and planetary strengths to identify the right Activation Levers.'],['STEP III','Activate','Apply in real life. Daily practices with defined windows, observable outcomes, follow-up calls and voice notes.']].map(([num,name,text],i)=>(
              <div key={num} className="reveal" style={{padding:'32px 28px',borderRight:i<2?'1px solid var(--line)':'none',position:'relative'}}>
                <span style={{display:'inline-block',fontFamily:'var(--f-caps)',fontSize:'10px',color:'var(--gold-deep)',letterSpacing:'3px',marginBottom:'12px',padding:'4px 10px',background:'var(--gold-pale)',border:'1px solid var(--gold)',borderRadius:'100px'}}>{num}</span>
                <div style={{fontFamily:'var(--f-display)',fontSize:'30px',fontWeight:500,color:'var(--teal-deep)',marginBottom:'10px'}}>{name}</div>
                <div style={{fontFamily:'var(--f-sans)',fontSize:'13px',lineHeight:1.65,color:'var(--warm-mid)'}}>{text}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:'48px',textAlign:'center'}}>
            <div style={{fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'4px',textTransform:'uppercase',color:'var(--gold-deep)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px',justifyContent:'center'}}>
              <span style={{width:'24px',height:'1px',background:'var(--gold)',display:'inline-block'}}/>FIVE ACTIVATION LEVERS
            </div>
            <h3 style={{fontFamily:'var(--f-display)',fontSize:'clamp(20px,2.5vw,30px)',fontWeight:300,color:'var(--teal-deep)'}}>Mantra · Yoga · Gemstone · Seva · Colour</h3>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px',marginTop:'36px'}}>
            {[['ॐ','MANTRA','sound'],['𓏶','YOGA','breath'],['◈','GEMSTONE','support'],['✿','SEVA','service'],['◉','COLOUR','frequency']].map(([icon,name,sub])=>(
              <div key={name} className="reveal lever" style={{background:'var(--cream)',border:'1px solid var(--line)',padding:'18px 14px',textAlign:'center',transition:'all 0.3s'}}>
                <div style={{width:'38px',height:'38px',margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--saff-soft)',borderRadius:'50%',color:'var(--saff-deep)',fontSize:'18px'}}>{icon}</div>
                <div style={{fontFamily:'var(--f-caps)',fontSize:'10px',letterSpacing:'2px',color:'var(--teal-deep)',marginBottom:'2px'}}>{name}</div>
                <div style={{fontFamily:'var(--f-sans)',fontSize:'10px',color:'var(--warm-muted)',fontStyle:'italic'}}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:'48px'}}>
            <div style={{textAlign:'center',marginBottom:'32px'}}>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'4px',color:'var(--gold-deep)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px',justifyContent:'center'}}>
                <span style={{width:'24px',height:'1px',background:'var(--gold)',display:'inline-block'}}/>THE SIGNATURE LAYER
              </div>
              <h3 style={{fontFamily:'var(--f-display)',fontWeight:300,fontSize:'clamp(24px,3vw,38px)',lineHeight:1.1,color:'var(--teal-deep)'}}>The Activation <em style={{fontStyle:'italic',color:'var(--saff-deep)'}}>Stack™</em></h3>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
              {[['Stabilisation Stack','MANTRA + BREATH + COLOUR','For anxiety, overthinking, sleep disturbance.'],['Acceleration Stack','GEMSTONE + TIMING + COLOUR','For career moves, money decisions, business launches.'],['Karmic Release Stack','SEVA + FASTING + MANTRA','For delays, stuck patterns, repeated blockages.']].map(([name,formula,purpose])=>(
                <div key={name} className="reveal" style={{background:'linear-gradient(180deg,var(--cream) 0%,var(--gold-pale) 100%)',border:'1px solid var(--gold)',padding:'24px 22px',position:'relative'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,var(--saffron),var(--gold))'}}/>
                  <div style={{fontFamily:'var(--f-display)',fontSize:'22px',fontWeight:500,color:'var(--teal-deep)',marginBottom:'6px'}}>{name}</div>
                  <div style={{fontFamily:'var(--f-sans)',fontSize:'11px',color:'var(--gold-deep)',fontWeight:500,letterSpacing:'1px',marginBottom:'12px',textTransform:'uppercase'}}>{formula}</div>
                  <div style={{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'14px',color:'var(--warm-mid)',lineHeight:1.55}}>{purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section style={{background:'linear-gradient(135deg,var(--saffron) 0%,var(--saff-deep) 100%)',padding:'clamp(48px,6vw,80px) var(--pad)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'relative',zIndex:2,maxWidth:'var(--max)',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <span style={{fontFamily:'var(--f-caps)',fontSize:'10px',letterSpacing:'4px',color:'rgba(255,255,255,0.7)',textTransform:'uppercase',marginBottom:'12px',display:'block'}}>Real Activation Outcomes</span>
            <h2 style={{fontFamily:'var(--f-display)',fontSize:'clamp(30px,4vw,48px)',fontWeight:300,color:'var(--cream)',letterSpacing:'-0.02em',lineHeight:1.1}}>What activation <em style={{fontStyle:'italic',color:'var(--gold-pale)'}}>actually shifts.</em></h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
            {[['Marriage moved','in 6 months','Acceleration Stack'],['Role change','in 90 days','Acceleration Stack'],['Anxiety reduced','in 21 days','Stabilisation Stack'],['Stalled project','completed in 60 days','Karmic Release Stack'],['Conversion rate','doubled in 90 days','Communication Stack'],['Sleep restored','in 14 days','Stabilisation Stack']].map(([r1,r2,stack])=>(
              <div key={r1} className="reveal" style={{background:'rgba(253,248,239,0.96)',padding:'20px 22px'}}>
                <div style={{fontFamily:'var(--f-display)',fontSize:'18px',fontWeight:500,color:'var(--teal-deep)',lineHeight:1.3,marginBottom:'6px'}}><em style={{fontStyle:'italic',color:'var(--saff-deep)'}}>{r1}</em><br/>{r2}</div>
                <div style={{fontFamily:'var(--f-caps)',fontSize:'8px',letterSpacing:'2px',color:'var(--gold-deep)',textTransform:'uppercase'}}>{stack}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'clamp(56px,8vw,108px) var(--pad)',background:'var(--cream-2)'}} id="readings">
        <div style={{maxWidth:'var(--max)',margin:'0 auto'}}>
          <div style={{fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'4px',textTransform:'uppercase',color:'var(--gold-deep)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{width:'24px',height:'1px',background:'var(--gold)',display:'inline-block'}}/>Verified Client Voices
          </div>
          <h2 className="reveal" style={{fontFamily:'var(--f-display)',fontWeight:300,fontSize:'clamp(30px,4vw,52px)',lineHeight:1.1,color:'var(--teal-deep)',marginBottom:'32px'}}>What clients say.</h2>
          <div className="reveal" style={{background:'linear-gradient(135deg,var(--teal-deep) 0%,var(--teal-darker) 100%)',padding:'clamp(28px,4vw,48px)',border:'1px solid rgba(201,168,76,0.3)',position:'relative',overflow:'hidden',marginBottom:'24px'}}>
            <div style={{fontFamily:'var(--f-display)',fontSize:'clamp(17px,2.2vw,26px)',fontWeight:300,lineHeight:1.45,fontStyle:'italic',color:'var(--cream)',position:'relative',zIndex:1,marginBottom:'20px',maxWidth:'840px'}}>
              "Deeply insightful and thoughtfully structured. Clear, relatable, practical. <em style={{fontStyle:'normal',color:'var(--gold)',fontWeight:400}}>Personalised and meaningful.</em> Particularly appreciated the timelines and actionable guidance — genuinely useful, not just informative."
            </div>
            <div style={{borderTop:'1px solid rgba(201,168,76,0.3)',paddingTop:'16px'}}>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'13px',fontWeight:600,letterSpacing:'2px',color:'var(--gold)',marginBottom:'4px'}}>Pooja Makwana</div>
              <div style={{fontFamily:'var(--f-sans)',fontSize:'11px',color:'rgba(253,248,239,0.75)',letterSpacing:'0.5px'}}>Working Professional · Mumbai · 5-Year Career & Wealth Blueprint</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px',marginTop:'24px'}}>
            {[{stars:'★★★★★ · 9/10',text:'"Sure I will rate 9 out of 10. The KP analysis was specific, credible, and the Mercury combust insight gave language to something I have felt for years."',name:'Nisha Nirav Bhatt',detail:'Equity Advisor · Age 44 · Born Ghatkopar, Mumbai · Finance Career Blueprint'},{stars:'★★★★★',text:'"It explained exactly why the last three years felt like building in slow motion. The 2:6 cycle has a name now — and an end date. That alone was worth everything."',name:'Omkar Vishwas Patil',detail:'Startup Founder · Age 26 · Born Mumbai · 5-Year Business Growth Blueprint'}].map(t=>(
              <div key={t.name} className="reveal tcard" style={{background:'var(--cream)',border:'1px solid var(--line-soft)',padding:'24px 22px',transition:'border-color 0.25s,transform 0.25s'}}>
                <div style={{color:'var(--saffron)',fontSize:'12px',letterSpacing:'3px',marginBottom:'10px'}}>{t.stars}</div>
                <div style={{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'14px',lineHeight:1.55,color:'var(--warm-dark)',marginBottom:'14px'}}>{t.text}</div>
                <div style={{paddingTop:'12px',borderTop:'1px solid var(--line-soft)'}}>
                  <div style={{fontFamily:'var(--f-caps)',fontSize:'11px',fontWeight:600,color:'var(--teal-deep)',letterSpacing:'1.5px',marginBottom:'3px'}}>{t.name}</div>
                  <div style={{fontFamily:'var(--f-sans)',fontSize:'10px',color:'var(--warm-muted)',letterSpacing:'0.4px'}}>{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{padding:'clamp(56px,8vw,108px) var(--pad)',background:'var(--cream)'}} id="blueprint">
        <div style={{maxWidth:'var(--max)',margin:'0 auto'}}>
          <div className="reveal" style={{fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'4px',color:'var(--gold-deep)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{width:'24px',height:'1px',background:'var(--gold)',display:'inline-block'}}/>The Blueprint
          </div>
          <h2 className="reveal" style={{fontFamily:'var(--f-display)',fontWeight:300,fontSize:'clamp(30px,4vw,52px)',lineHeight:1.1,color:'var(--teal-deep)'}}>Four doorways. <em style={{fontStyle:'italic',color:'var(--saff-deep)'}}>One path.</em></h2>
          <p className="reveal" style={{fontFamily:'var(--f-sans)',fontSize:'15px',lineHeight:1.7,color:'var(--warm-mid)',marginTop:'16px',maxWidth:'640px',marginBottom:'36px'}}>Each reading includes the Activation Framework™ — engineered Stacks specific to you.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,border:'1px solid var(--line)'}}>
            {[{label:'Free · Entry',name:'Moment',price:'Complimentary',desc:'Birth chart, Moon nakshatra identity, one question per month.',link:'#ask',cta:'Begin Free →',feat:false},{label:'Most Chosen',name:'Ask',price:'₹99 / $5 USD',desc:'One specific question, chart-grounded answer within 2 hours via WhatsApp.',link:'#ask',cta:'Ask Now →',feat:true},{label:'Single Reading',name:'Spark',price:'₹199 / $9 USD',desc:'One focused reading + Activation Stack. Within 24 hours.',link:'/auth/signup',cta:'Order →',feat:false},{label:'Full Blueprint',name:'Blueprint',price:'₹999 / $39 USD',desc:'15 pages + Activation Stack + follow-up call + voice notes.',link:'/auth/signup',cta:'Order →',feat:false}].map((p,i)=>(
              <div key={p.name} className="price-card" style={{padding:'28px 22px',borderRight:i<3?'1px solid var(--line)':'none',background:p.feat?'linear-gradient(180deg,var(--teal-deep) 0%,var(--teal-darker) 100%)':'var(--cream)',position:'relative',transition:'background 0.3s'}}>
                {p.feat && <div style={{position:'absolute',top:'-1px',left:'50%',transform:'translateX(-50%)',background:'var(--saffron)',color:'var(--cream)',fontFamily:'var(--f-caps)',fontSize:'8px',letterSpacing:'2.5px',padding:'4px 12px'}}>MOST CHOSEN</div>}
                <div style={{fontFamily:'var(--f-sans)',fontSize:'9px',letterSpacing:'2.5px',textTransform:'uppercase',color:p.feat?'rgba(253,248,239,0.65)':'var(--warm-muted)',marginBottom:'10px'}}>{p.label}</div>
                <div style={{fontFamily:'var(--f-display)',fontSize:'26px',fontWeight:500,color:p.feat?'var(--cream)':'var(--teal-deep)',marginBottom:'4px'}}>{p.name}</div>
                <div style={{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'16px',color:p.feat?'var(--gold)':'var(--saff-deep)',marginBottom:'14px'}}>{p.price}</div>
                <div style={{fontFamily:'var(--f-sans)',fontSize:'12px',lineHeight:1.6,color:p.feat?'rgba(253,248,239,0.75)':'var(--warm-mid)',marginBottom:'18px',minHeight:'56px'}}>{p.desc}</div>
                <Link href={p.link} style={{fontFamily:'var(--f-caps)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',color:p.feat?'var(--gold)':'var(--saff-deep)',textDecoration:'none',borderBottom:`1px solid ${p.feat?'rgba(201,168,76,0.5)':'var(--gold)'}`,paddingBottom:'2px',display:'inline-block'}}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ASK FORM */}
      <section style={{padding:'clamp(56px,8vw,108px) var(--pad)',background:'var(--cream-2)'}} id="ask">
        <div style={{maxWidth:'var(--max)',margin:'0 auto'}}>
          <div className="reveal" style={{fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'4px',color:'var(--gold-deep)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{width:'24px',height:'1px',background:'var(--gold)',display:'inline-block'}}/>Prashna Kundali
          </div>
          <h2 className="reveal" style={{fontFamily:'var(--f-display)',fontWeight:300,fontSize:'clamp(30px,4vw,52px)',lineHeight:1.1,color:'var(--teal-deep)'}}>One question. <em style={{fontStyle:'italic',color:'var(--saff-deep)'}}>Two hours.</em></h2>
          <p className="reveal" style={{fontFamily:'var(--f-sans)',fontSize:'15px',lineHeight:1.7,color:'var(--warm-mid)',marginTop:'16px',maxWidth:'640px',marginBottom:'36px'}}>The ancient practice of reading the moment of your question as a chart in itself.</p>
          <div style={{display:'grid',gridTemplateColumns:'0.42fr 1fr',gap:'clamp(28px,4vw,64px)',alignItems:'start'}}>
            <div className="reveal">
              <div style={{fontFamily:'var(--f-display)',fontSize:'clamp(22px,2.6vw,34px)',fontWeight:300,color:'var(--teal-deep)',marginBottom:'6px'}}>How it works.</div>
              <div style={{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'15px',color:'var(--warm-mid)',lineHeight:1.5,marginBottom:'24px'}}>Your question's exact moment becomes a chart, read in the KP system.</div>
              {[['i','Submit','Birth details and your question.'],['ii','Pay ₹99 / $5','Via UPI, Razorpay or Stripe.'],['iii','Chart Read','KP analysis of your question\'s moment.'],['iv','Answer','Yes · No · Wait with reasoning.']].map(([n,t,s])=>(
                <div key={n} style={{display:'flex',gap:'14px',padding:'14px 0',borderBottom:'1px solid var(--line-soft)'}}>
                  <div style={{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'22px',color:'var(--gold)',lineHeight:1,flexShrink:0,width:'24px'}}>{n}</div>
                  <div><div style={{fontFamily:'var(--f-sans)',fontSize:'12px',fontWeight:600,letterSpacing:'1px',color:'var(--teal-deep)',marginBottom:'2px'}}>{t}</div><div style={{fontFamily:'var(--f-sans)',fontSize:'11px',color:'var(--warm-muted)',lineHeight:1.5}}>{s}</div></div>
                </div>
              ))}
            </div>
            <div className="reveal" style={{background:'var(--cream)',border:'1px solid var(--line)',padding:'clamp(22px,3vw,36px)',position:'relative'}}>
              <div style={{position:'absolute',top:'-1px',left:'-1px',width:'48px',height:'2px',background:'var(--saffron)'}}/>
              <div style={{position:'absolute',top:'-1px',left:'-1px',width:'2px',height:'48px',background:'var(--saffron)'}}/>
              <span style={{fontFamily:'var(--f-caps)',fontSize:'9px',fontWeight:500,letterSpacing:'2.5px',color:'var(--gold-deep)',borderBottom:'1px solid var(--line-soft)',paddingBottom:'12px',marginBottom:'18px',display:'block'}}>ASK · ₹99 / $5 · TWO HOURS</span>
              <label style={{fontFamily:'var(--f-sans)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--warm-mid)',display:'block',marginBottom:'6px'}}>Your Name</label>
              <input type="text" id="ak_name" style={{width:'100%',padding:'11px 13px',fontFamily:'var(--f-sans)',fontSize:'14px',color:'var(--warm-dark)',background:'var(--cream-2)',border:'1px solid var(--line-soft)',marginBottom:'14px',display:'block',outline:'none'}} placeholder="Full name"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                <div>
                  <label style={{fontFamily:'var(--f-sans)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--warm-mid)',display:'block',marginBottom:'6px'}}>Date of Birth</label>
                  <input type="date" id="ak_dob" style={{width:'100%',padding:'11px 13px',fontFamily:'var(--f-sans)',fontSize:'14px',color:'var(--warm-dark)',background:'var(--cream-2)',border:'1px solid var(--line-soft)',outline:'none'}}/>
                </div>
                <div>
                  <label style={{fontFamily:'var(--f-sans)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--warm-mid)',display:'block',marginBottom:'6px'}}>Time of Birth</label>
                  <input type="time" id="ak_tob" style={{width:'100%',padding:'11px 13px',fontFamily:'var(--f-sans)',fontSize:'14px',color:'var(--warm-dark)',background:'var(--cream-2)',border:'1px solid var(--line-soft)',outline:'none'}}/>
                </div>
              </div>
              <label style={{fontFamily:'var(--f-sans)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--warm-mid)',display:'block',marginBottom:'6px'}}>Place of Birth</label>
              <input type="text" id="ak_pob" style={{width:'100%',padding:'11px 13px',fontFamily:'var(--f-sans)',fontSize:'14px',color:'var(--warm-dark)',background:'var(--cream-2)',border:'1px solid var(--line-soft)',marginBottom:'14px',display:'block',outline:'none'}} placeholder="City, Country"/>
              <label style={{fontFamily:'var(--f-sans)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--warm-mid)',display:'block',marginBottom:'6px'}}>Area</label>
              <select id="ak_area" style={{width:'100%',padding:'11px 13px',fontFamily:'var(--f-sans)',fontSize:'14px',color:'var(--warm-dark)',background:'var(--cream-2)',border:'1px solid var(--line-soft)',marginBottom:'14px',display:'block',outline:'none'}}>
                {['career','business','money','marriage','family','health','travel','education','spiritual'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select>
              <label style={{fontFamily:'var(--f-sans)',fontSize:'9px',fontWeight:500,letterSpacing:'2px',textTransform:'uppercase',color:'var(--warm-mid)',display:'block',marginBottom:'6px'}}>Your Question</label>
              <textarea id="ak_q" rows={3} style={{width:'100%',padding:'11px 13px',fontFamily:'var(--f-sans)',fontSize:'14px',color:'var(--warm-dark)',background:'var(--cream-2)',border:'1px solid var(--line-soft)',marginBottom:'8px',display:'block',outline:'none',resize:'none'}} placeholder="Be specific."/>
              <span style={{fontFamily:'var(--f-sans)',fontSize:'10px',fontStyle:'italic',color:'var(--warm-muted)',marginBottom:'14px',display:'block'}}>We don't predict death timing, third-party behaviour, or election outcomes.</span>
              <button onClick={submitAsk} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,var(--saffron),var(--saff-deep))',color:'var(--cream)',border:'none',fontFamily:'var(--f-caps)',fontSize:'11px',fontWeight:500,letterSpacing:'2.5px',cursor:'pointer',boxShadow:'0 4px 18px rgba(184,93,16,0.3)'}}>SEND VIA WHATSAPP →</button>
              <p style={{textAlign:'center',marginTop:'10px',fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'12px',color:'var(--warm-muted)',lineHeight:1.5}}>Opens in WhatsApp. Payment in chat. Answer within 2 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REFUND */}
      <div id="refund" style={{background:'linear-gradient(135deg,var(--saffron) 0%,var(--saff-deep) 100%)',padding:'clamp(40px,5vw,64px) var(--pad)',textAlign:'center'}}>
        <div style={{maxWidth:'720px',margin:'0 auto'}}>
          <div className="reveal" style={{fontFamily:'var(--f-display)',fontSize:'clamp(24px,3.4vw,42px)',fontWeight:300,lineHeight:1.2,color:'var(--cream)',fontStyle:'italic',marginBottom:'14px'}}>If it isn't written specifically for you,<br/>we give your money back.</div>
          <p className="reveal" style={{fontFamily:'var(--f-sans)',fontSize:'14px',color:'rgba(253,248,239,0.85)',lineHeight:1.6,marginBottom:'24px'}}>7-day full refund assurance. Full refund via UPI / Razorpay / Stripe within 48 hours. No questions asked.</p>
          <Link href="/auth/signup" className="reveal" style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'var(--cream)',color:'var(--saff-deep)',padding:'14px 30px',fontFamily:'var(--f-caps)',fontSize:'11px',fontWeight:500,letterSpacing:'2.5px',textDecoration:'none',boxShadow:'0 4px 16px rgba(61,43,26,0.15)'}}>Begin Your First Reading →</Link>
        </div>
      </div>

      {/* LEGAL */}
      <section style={{background:'var(--cream-3)',padding:'48px var(--pad)'}} id="legal">
        <div style={{maxWidth:'var(--max)',margin:'0 auto'}}>
          <div style={{fontFamily:'var(--f-caps)',fontSize:'10px',fontWeight:500,letterSpacing:'4px',color:'var(--gold-deep)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{width:'24px',height:'1px',background:'var(--gold)',display:'inline-block'}}/>Boundaries · Promise · Disclaimers
          </div>
          <h3 style={{fontFamily:'var(--f-display)',fontSize:'clamp(20px,2.4vw,28px)',fontWeight:300,color:'var(--teal-deep)',marginTop:'6px',marginBottom:'8px'}}>What NAKSH369 will never predict.</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginTop:'24px'}}>
            {[['⚖️','Death · Longevity','We do not predict death timing or lifespan.'],['📈','Specific Stocks','We discuss wealth timing — never specific securities.'],['🗳️','Elections · Sports','Political and sports outcomes are outside our ethical scope.'],['👶','Child Gender','Predicting unborn child gender is illegal under PCPNDT Act 1994.']].map(([icon,title,text])=>(
              <div key={title} style={{padding:'18px 16px',border:'1px solid var(--line-soft)',background:'var(--cream)'}}>
                <div style={{fontSize:'18px',marginBottom:'8px'}}>{icon}</div>
                <div style={{fontFamily:'var(--f-caps)',fontSize:'9px',letterSpacing:'2px',color:'var(--gold-deep)',marginBottom:'4px'}}>{title}</div>
                <div style={{fontFamily:'var(--f-sans)',fontSize:'11px',color:'var(--warm-mid)',lineHeight:1.55}}>{text}</div>
              </div>
            ))}
          </div>
          <div id="privacy" style={{marginTop:'32px',padding:'20px 24px',background:'var(--cream)',border:'1px solid var(--line-soft)'}}>
            <div style={{fontFamily:'var(--f-caps)',fontSize:'10px',letterSpacing:'2px',color:'var(--gold-deep)',marginBottom:'8px'}}>PRIVACY · DPDP 2023</div>
            <p style={{fontFamily:'var(--f-sans)',fontSize:'12px',color:'var(--warm-mid)',lineHeight:1.6}}>Your birth details are used solely to prepare your reading. Data is encrypted, never sold or shared. Stored under DPDP Act 2023 (India). For data deletion: WhatsApp +91 83559 04017.</p>
          </div>
          <p style={{marginTop:'18px',fontFamily:'var(--f-sans)',fontSize:'11px',color:'var(--warm-muted)',lineHeight:1.6}}>NAKSH369 readings are for spiritual guidance and personal reflection only. Not professional financial, medical, legal, or investment advice.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'linear-gradient(180deg,var(--teal-deep) 0%,var(--teal-darker) 100%)',color:'var(--cream)',padding:'48px var(--pad) 28px'}}>
        <div style={{maxWidth:'var(--max)',margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr',gap:'32px',paddingBottom:'32px',borderBottom:'1px solid rgba(201,168,76,0.2)'}}>
            <div>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'24px',fontWeight:600,letterSpacing:'2px',marginBottom:'4px',color:'var(--gold-pale)'}}>NAKSH<span style={{color:'var(--gold)'}}>369</span>®</div>
              <div style={{fontFamily:'var(--f-display)',fontStyle:'italic',fontSize:'14px',color:'rgba(253,248,239,0.7)',marginBottom:'12px'}}>Know Your Moment.®</div>
              <div style={{fontFamily:'var(--f-sans)',fontSize:'12px',lineHeight:1.65,color:'rgba(253,248,239,0.55)',maxWidth:'280px'}}>Personal Blueprint Platform. Vedic intelligence, verified charts, NAKSH Activation Framework™. Mumbai · Worldwide.</div>
              <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap',marginTop:'14px',fontFamily:'var(--f-sans)',fontSize:'10px',color:'rgba(253,248,239,0.55)',letterSpacing:'1px'}}>
                <span>India · UPI / Razorpay</span><span>·</span><span>International · Stripe</span>
              </div>
            </div>
            <div>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'9px',fontWeight:500,letterSpacing:'3px',color:'var(--gold)',marginBottom:'14px'}}>The Blueprint</div>
              <ul style={{listStyle:'none'}}>
                {[['#ask','Ask · ₹99 / $5'],['#blueprint','Spark · ₹199 / $9'],['/auth/signup','Blueprint · ₹999 / $39'],['https://wa.me/918355904017','Bespoke']].map(([href,label])=>(
                  <li key={label} style={{marginBottom:'8px'}}><a href={href} style={{fontFamily:'var(--f-sans)',fontSize:'12px',color:'rgba(253,248,239,0.65)',textDecoration:'none'}}>{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'9px',fontWeight:500,letterSpacing:'3px',color:'var(--gold)',marginBottom:'14px'}}>Platform</div>
              <ul style={{listStyle:'none'}}>
                {[['#framework','Activation Framework™'],['#readings','Readings'],['#legal','Disclaimers'],['#refund','Refund Policy'],['/auth/login','Sign In'],['/auth/signup','Begin Reading']].map(([href,label])=>(
                  <li key={label} style={{marginBottom:'8px'}}><a href={href} style={{fontFamily:'var(--f-sans)',fontSize:'12px',color:'rgba(253,248,239,0.65)',textDecoration:'none'}}>{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{fontFamily:'var(--f-caps)',fontSize:'9px',fontWeight:500,letterSpacing:'3px',color:'var(--gold)',marginBottom:'14px'}}>Contact</div>
              <ul style={{listStyle:'none'}}>
                {[['https://wa.me/918355904017','WhatsApp · +91 83559 04017'],['https://instagram.com/naksh369','Instagram · @naksh369']].map(([href,label])=>(
                  <li key={label} style={{marginBottom:'8px'}}><a href={href} style={{fontFamily:'var(--f-sans)',fontSize:'12px',color:'rgba(253,248,239,0.65)',textDecoration:'none'}}>{label}</a></li>
                ))}
                <li style={{marginBottom:'8px',fontFamily:'var(--f-sans)',fontSize:'12px',color:'rgba(253,248,239,0.65)'}}>Mumbai · Available Worldwide</li>
              </ul>
            </div>
          </div>
          <div style={{paddingTop:'20px',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'10px',fontFamily:'var(--f-sans)',fontSize:'10px',color:'rgba(253,248,239,0.4)',letterSpacing:'0.5px'}}>
            <div>© 2026 NAKSH369® · NAKSH Activation Framework™</div>
            <div>SSL · UPI · Razorpay · Stripe · DPDP 2023 · 7-Day Refund</div>
          </div>
        </div>
      </footer>
    </>
  );
}
