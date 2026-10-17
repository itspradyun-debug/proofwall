import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="wrap">
        <header className="top">
          <Link href="/" className="logo"><i aria-hidden="true" />ProofWall</Link>
          <nav className="nav">
            <Link href="/login">Sign in</Link>
            <Link href="/login" className="btn small">Create your wall</Link>
          </nav>
        </header>
        <section className="hero">
          <h1>Let your happy customers sell for you.</h1>
          <p className="lead">
            Collect written and video testimonials with one link. Show the best ones on your website with one line of code.
          </p>
          <div className="row">
            <Link href="/login" className="btn">Get started</Link>
          </div>
        </section>
        <section className="stack" style={{ maxWidth: 700 }}>
          <div className="card">
            <h3>1. Collect</h3>
            <p className="muted">Share one link by WhatsApp or email. Customers write or record a review in under a minute, no account needed.</p>
          </div>
          <div className="card">
            <h3>2. Approve</h3>
            <p className="muted">Every review lands in your dashboard first. You choose what goes public.</p>
          </div>
          <div className="card">
            <h3>3. Display</h3>
            <p className="muted">Paste one line of code into your website. Your Wall of Love updates as you approve more.</p>
          </div>
        </section>
      </div>
      <footer className="foot">
        <div className="wrap">
          <span>© 2026 ProofWall (test build)</span>
          <span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span>
        </div>
      </footer>
    </>
  );
}
