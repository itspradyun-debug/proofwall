'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { friendly, slugify } from '@/lib/util';

type Usage = {
  plan: string; plan_label: string; max_walls: number; walls_used: number;
  max_videos: number; videos_used: number; remove_branding: boolean;
};
type Wall = { id: string; name: string; slug: string; brand_color: string };

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [usage, setUsage] = useState<Usage | null>(null);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }
    setEmail(session.user.email || '');
    const [u, w, t] = await Promise.all([
      supabase.rpc('my_usage'),
      supabase.from('walls').select('id,name,slug,brand_color').order('created_at'),
      supabase.from('testimonials').select('wall_id').eq('status', 'pending'),
    ]);
    setUsage(((u.data as Usage[] | null) || [])[0] ?? null);
    setWalls((w.data as Wall[] | null) || []);
    const c: Record<string, number> = {};
    ((t.data as { wall_id: string }[] | null) || []).forEach((r) => { c[r.wall_id] = (c[r.wall_id] || 0) + 1; });
    setPending(c);
    setReady(true);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function createWall(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }
    const { data, error } = await supabase
      .from('walls')
      .insert({ owner_id: session.user.id, name: name.trim(), slug: slug.trim() })
      .select('id')
      .single();
    setBusy(false);
    if (error) { setMsg({ t: 'err', m: friendly(error) }); return; }
    router.push('/dashboard/' + data.id);
  }

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc('redeem_code', { p_code: code });
    setBusy(false);
    if (error) { setMsg({ t: 'err', m: friendly(error) }); return; }
    setCode('');
    setMsg({ t: 'ok', m: 'Code accepted. You are now on the ' + data + ' plan.' });
    load();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (!ready) return <div className="wrap"><p className="muted" style={{ padding: 40 }}>Loading…</p></div>;

  const atLimit = usage ? usage.walls_used >= usage.max_walls : false;

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="logo"><i aria-hidden="true" />ProofWall</Link>
        <div className="nav"><span>{email}</span><button className="btn ghost small" onClick={signOut}>Sign out</button></div>
      </header>

      <div className="stack">
        {msg && <div className={'msg ' + msg.t} role="status">{msg.m}</div>}

        {usage && (
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <h2>Your plan</h2>
              <span className="pill">{usage.plan_label}</span>
            </div>
            <div className="usage">
              <div><b>{usage.walls_used} / {usage.max_walls}</b><span className="muted small">walls</span></div>
              <div><b>{usage.videos_used} / {usage.max_videos}</b><span className="muted small">video testimonials this month</span></div>
              <div><b>{usage.remove_branding ? 'Off' : 'On'}</b><span className="muted small">“Powered by ProofWall” label</span></div>
            </div>
          </div>
        )}

        <div className="card stack">
          <h2>Your walls</h2>
          {walls.length === 0 && <p className="muted">You have no walls yet. Create your first one below.</p>}
          {walls.map((w) => (
            <Link key={w.id} href={'/dashboard/' + w.id} className="card row between" style={{ textDecoration: 'none' }}>
              <div>
                <h3>{w.name}</h3>
                <span className="muted small">/w/{w.slug}</span>
              </div>
              {pending[w.id] ? <span className="pill warn">{pending[w.id]} to review</span> : <span className="pill gray">Up to date</span>}
            </Link>
          ))}
        </div>

        <form className="card stack" onSubmit={createWall}>
          <h2>Create a wall</h2>
          {atLimit ? (
            <p className="muted">You have used all the walls in your plan. Redeem a code below to get more.</p>
          ) : (
            <>
              <label>Business name
                <input type="text" required maxLength={80} value={name}
                  onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
              </label>
              <label>Web address
                <input type="text" required value={slug}
                  onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
                <span className="muted small">Customers will use: /w/{slug || 'your-business'}</span>
              </label>
              <button className="btn" disabled={busy || !name || slug.length < 3}>Create wall</button>
            </>
          )}
        </form>

        <form className="card stack" onSubmit={redeem}>
          <h2>Redeem a code</h2>
          <label>AppSumo code
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="PW-XXXXXXXXXX" autoComplete="off" />
          </label>
          <button className="btn" disabled={busy || !code}>Redeem</button>
        </form>
      </div>

      <footer className="foot"><div className="wrap"><span>ProofWall test build</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div></footer>
    </div>
  );
}
