import Link from 'next/link';

export const metadata = { title: 'Terms of service | ProofWall' };

export default function Terms() {
  return (
    <div className="wrap">
      <header className="top"><Link href="/" className="logo"><i aria-hidden="true" />ProofWall</Link></header>
      <div className="prose">
        <h1 style={{ fontSize: '2.2rem' }}>Terms of service</h1>
        <div className="notice">
          Draft template for the test build. Replace the bracketed items and have it reviewed by a qualified professional
          before you sell to the public.
        </div>
        <p className="muted">Last updated: [date]</p>
        <h2>The service</h2>
        <p>ProofWall lets a business collect customer testimonials and display approved ones on its website. The service is provided by [legal entity name].</p>
        <h2>Your account</h2>
        <p>You are responsible for your account and for the content you display. Only publish testimonials you have the right to publish, and do not use ProofWall to display fake or misleading reviews.</p>
        <h2>Lifetime plans</h2>
        <p>A lifetime plan gives you access to your purchased tier for as long as ProofWall is operated, including updates to that tier. Plan limits (number of walls and monthly video testimonials) apply. [State your refund window, e.g. 60 days, and your policy if the service is discontinued.]</p>
        <h2>Acceptable use</h2>
        <p>Do not upload unlawful, abusive or infringing content, and do not attempt to disrupt or reverse engineer the service. We may remove content or suspend accounts that break these terms.</p>
        <h2>Availability and liability</h2>
        <p>We work to keep the service running but do not guarantee uninterrupted access. To the extent the law allows, [legal entity name] is not liable for indirect or consequential losses. [Add governing law and jurisdiction.]</p>
        <h2>Contact</h2>
        <p>[support email]</p>
      </div>
    </div>
  );
}
