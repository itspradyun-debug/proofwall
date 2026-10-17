'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BUCKET, supabase } from '@/lib/supabase';
import { friendly, stars } from '@/lib/util';

type Wall = { id: string; name: string; slug: string; brand_color: string; thank_you: string };
type Item = {
  id: string; author_name: string; author_role: string | null; rating: number;
  body: string | null; video_path: string | null; status: 'pending' | 'approved' | 'hidden'; created_at: string;
};
type Tab = 'pending' | 'approved' | 'hidden' | 'all';

export default function WallPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wall, setWall] = useState<Wall | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tab, setTab] = useState<Tab>('pending');
  const [origin, setOrigin] = useState('');
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [form, setForm] = useState({ name: '', color: '#F2B01E', thanks: '' });
  const [previewKey, setPreviewKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace('/login'); return; }
    const w = await supabase.from('walls').select('id,name,slug,brand_color,thank_you').eq('id', id).maybeSingle();
    if (!w.data) { router.replace('/dashboard'); return; }
    setWall(w.data as Wall);
    setForm({ name: w.data.name, color: w.data.brand_color, thanks: w.data.thank_you });
    const t = await supabase.from('testimonials').select('*').eq('wall_id', id).order('created_at', { ascending: false });
    setItems((t.data as Item[] | null) || []);
  }, [id, router]);

  useEffect(() => { setOrigin(window.location.origin); load(); }, [load]);

  // Live widget preview: injects the real embed script, exactly as a customer site would.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !wall || !origin) return;
    el.innerHTML = '';
    const s = document.createElement('script');
    s.src = origin + '/widget.js?v=' + previewKey;
    s.async = true;
    s.setAttribute('data-wall', wall.slug);
    el.appendChild(s);
  }, [wall, origin, previewKey]);

  async function setStatus(it: Item, status: Item['status']) {
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', it.id);
    if (error) { setMsg({ t: 'err', m: friendly(error) }); return; }
    setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, status } : x)));
    setPreviewKey((k) => k + 1);
  }

  async function remove(it: Item) {
    const { error } = await supabase.from('testimonials').delete().eq('id', it.id);
    if (error) { setMsg({ t: 'err', m: friendly(error) }); return; }
    if (it.video_path) await supabase.storage.from(BUCKET).remove([it.video_path]);
    setItems((xs) => xs.filter((x) => x.id !== it.id));
    setConfirmDel(null);
    setPreviewKey((k) => k + 1);
  }

  async function play(it: Item) {
    if (!it.video_path) return;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(it.video_path, 3600);
    if (error || !data) { setMsg({ t: 'err', m: 'The video could not be loaded.' }); return; }
    setVideoUrls((v) => ({ ...v, [it.id]: data.signedUrl }));
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('walls')
      .update({ name: form.name.trim(), brand_color: form.color, thank_you: form.thanks.trim() })
      .eq('id', id);
    if (error) { setMsg({ t: 'err', m: friendly(error) }); return; }
    setMsg({ t: 'ok', m: 'Saved.' });
    setPreviewKey((k) => k + 1);
    load();
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setMsg({ t: 'ok', m: 'Copied.' }); }
    catch { setMsg({ t: 'err', m: 'Copy failed. Select the text and copy it manually.' }); }
  }

  if (!wall) return <div className="wrap"><p className="muted" style={{ padding: 40 }}>Loading…</p></div>;

  const link = origin + '/w/' + wall.slug;
  const shareText = `Hi! Thank you for choosing ${wall.name}. Would you share a quick testimonial? It takes less than a minute: ${link}`;
  const embed = `<script src="${origin}/widget.js" data-wall="${wall.slug}" async></script>`;
  const shown = items.filter((i) => tab === 'all' || i.status === tab);
  const count = (s: Item['status']) => items.filter((i) => i.status === s).length;

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/dashboard" className="logo"><i aria-hidden="true" />ProofWall</Link>
        <Link href="/dashboard" className="nav">← All walls</Link>
      </header>

      <div className="stack">
        <h1 style={{ fontSize: '2rem' }}>{wall.name}</h1>
        {msg && <div className={'msg ' + msg.t} role="status">{msg.m}</div>}

        <div className="card stack">
          <h2>1. Collect testimonials</h2>
          <div className="code">{link}</div>
          <div className="row">
            <button className="btn small" onClick={() => copy(link)}>Copy link</button>
            <a className="btn ok small" target="_blank" rel="noopener" href={'https://wa.me/?text=' + encodeURIComponent(shareText)}>Send on WhatsApp</a>
            <a className="btn ok small" href={`mailto:?subject=${encodeURIComponent('Could you share a quick testimonial?')}&body=${encodeURIComponent(shareText)}`}>Send by email</a>
            <a className="btn ghost small" target="_blank" rel="noopener" href={link}>Open page</a>
          </div>
        </div>

        <div className="card stack">
          <h2>2. Review what came in</h2>
          <div className="tabs" role="group" aria-label="Filter testimonials">
            {(['pending', 'approved', 'hidden', 'all'] as Tab[]).map((t) => (
              <button key={t} className="tab" aria-pressed={tab === t} onClick={() => setTab(t)}>
                {t[0].toUpperCase() + t.slice(1)}{t !== 'all' ? ` (${count(t)})` : ` (${items.length})`}
              </button>
            ))}
          </div>
          {shown.length === 0 && <p className="muted">Nothing here yet.</p>}
          {shown.map((it) => (
            <div key={it.id} className="card t-card">
              <div className="row between">
                <span className="st" aria-label={it.rating + ' stars'}>{stars(it.rating)}</span>
                <span className={'pill ' + (it.status === 'approved' ? '' : it.status === 'pending' ? 'warn' : 'gray')}>{it.status}</span>
              </div>
              {it.body && <p className="body">{it.body}</p>}
              {it.video_path && (videoUrls[it.id]
                ? <video controls preload="metadata" src={videoUrls[it.id]} />
                : <div><button className="btn ghost small" onClick={() => play(it)}>Play video</button></div>)}
              <div className="muted small">
                <strong style={{ color: 'var(--ink)' }}>{it.author_name}</strong>
                {it.author_role ? ', ' + it.author_role : ''} · {new Date(it.created_at).toLocaleDateString()}
              </div>
              <div className="row">
                {it.status !== 'approved' && <button className="btn ok small" onClick={() => setStatus(it, 'approved')}>Approve</button>}
                {it.status !== 'hidden' && <button className="btn ghost small" onClick={() => setStatus(it, 'hidden')}>Hide</button>}
                {confirmDel === it.id ? (
                  <>
                    <button className="btn danger small" onClick={() => remove(it)}>Yes, delete</button>
                    <button className="btn ghost small" onClick={() => setConfirmDel(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn danger small" onClick={() => setConfirmDel(it.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card stack">
          <h2>3. Show them on your website</h2>
          <p className="muted">Paste this line where you want the wall to appear.</p>
          <div className="code">{embed}</div>
          <div className="row">
            <button className="btn small" onClick={() => copy(embed)}>Copy code</button>
            <span className="muted small">Add data-theme=&quot;dark&quot; for dark backgrounds.</span>
          </div>
          <h3>Live preview</h3>
          <div ref={previewRef} />
        </div>

        <form className="card stack" onSubmit={saveSettings}>
          <h2>Settings</h2>
          <label>Business name
            <input type="text" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Accent colour
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </label>
          <label>Thank-you message
            <textarea maxLength={300} value={form.thanks} onChange={(e) => setForm({ ...form, thanks: e.target.value })} />
          </label>
          <div><button className="btn">Save settings</button></div>
        </form>
      </div>
    </div>
  );
}
