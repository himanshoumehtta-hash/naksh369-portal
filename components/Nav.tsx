'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Nav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('naksh_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem('naksh_token');
    localStorage.removeItem('naksh_user');
    router.push('/');
  };

  return (
    <nav className="naksh-nav">
      <div className="naksh-nav-inner">
        <Link href="/" className="naksh-brand">
          <div className="naksh-brand-icon">ॐ</div>
          <div className="naksh-brand-text">
            <div className="naksh-brand-name">
              <span>N</span>AKSH<span>369</span>®
            </div>
            <div className="naksh-brand-tag">Know Your Moment</div>
          </div>
        </Link>
        <div className="naksh-nav-links">
          {user ? (
            <>
              <Link href="/dashboard" className="naksh-nav-link hide-mobile">Dashboard</Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="naksh-nav-link hide-mobile">Admin</Link>
              )}
              <button onClick={logout} className="naksh-nav-link">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="https://naksh369.com" className="naksh-nav-link hide-mobile">naksh369.com</Link>
              <Link href="/auth/login" className="naksh-nav-link hide-mobile">Sign In</Link>
              <Link href="/auth/signup" className="naksh-nav-cta">Begin Reading →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
