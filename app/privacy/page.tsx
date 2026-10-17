import Link from 'next/link';

export const metadata = { title: 'Privacy policy | ProofWall' };

export default function Privacy() {
  return (
    <div className="wrap">
      <header className="top"><Link href="/" className="logo"><i aria-hidden="true" />ProofWall</Link></header>
      <div className="prose">
        <h1 style={{ fontSize: '2.2rem' }}>Privacy policy</h1>
        <div className="notice">
          Draft template for the test build. Replace the bracketed items and have it reviewed by a qualified professional
          before you accept real customers. Indian businesses should check it against the Digital Personal Data Protection Act, 2023.
        </div>
        <p className="muted">Last updated: [date]</p>
        <h2>Who we are</h2>
        <p>ProofWall is operated by [legal entity name], [address, country]. Contact: [support email].</p>
        <h2>What we collect</h2>
        <p><strong>Account holders:</strong> email address and password (stored hashed by our authentication provider), the walls you create and your settings.</p>
        <p><strong>People who leave a testimonial:</strong> the name, optional role, star rating, written text and optional video they submit. We do not ask them to create an account.</p>
        <h2>How we use it</h2>
        <p>We store submissions so the account holder can review them, and we display only the ones the account holder approves, on their website through the ProofWall widget. We do not sell personal data.</p>
        <h2>Where it is stored</h2>
        <p>Data is stored with our infrastructure providers (Supabase for the database and file storage, Vercel for hosting) in [region]. [List any email or analytics providers you add.]</p>
        <h2>Retention and deletion</h2>
        <p>Account holders can delete any testimonial, including its video, from their dashboard. To delete an account or ask for a copy of your data, write to [support email].</p>
        <h2>Your rights</h2>
        <p>You can ask us to access, correct or delete your personal data by contacting [support email]. [Add any rights required in your jurisdiction.]</p>
      </div>
    </div>
  );
}
