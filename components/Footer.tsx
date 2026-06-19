export default function Footer() {
  return (
    <footer className="naksh-footer">
      <div className="naksh-footer-brand">
        <span>N</span>AKSH<span>369</span>®
      </div>
      <div className="naksh-footer-tag">Know Your Moment.®</div>
      <div className="naksh-footer-legal">
        <div>© {new Date().getFullYear()} NAKSH369. All rights reserved.</div>
        <div style={{marginTop: '4px'}}>
          For spiritual guidance and entertainment purposes only. Not medical, legal or financial advice.
        </div>
        <div style={{marginTop: '4px'}}>
          <a href="https://naksh369.com#legal" style={{color: 'rgba(253,248,239,0.55)', textDecoration: 'none', marginRight: '12px'}}>Disclaimers</a>
          <a href="https://naksh369.com#refund" style={{color: 'rgba(253,248,239,0.55)', textDecoration: 'none', marginRight: '12px'}}>Refund Policy</a>
          <a href="https://naksh369.com#privacy" style={{color: 'rgba(253,248,239,0.55)', textDecoration: 'none'}}>Privacy</a>
        </div>
      </div>
    </footer>
  );
}
