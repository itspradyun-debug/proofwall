'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BUCKET, supabase } from '@/lib/supabase';
import { friendly } from '@/lib/util';

type PublicWall = { id: string; name: string; brand_color: string; thank_you: string; show_branding: boolean };

const MAX_BYTES = 50 * 1024 * 1024;
const EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

export default function CollectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [wall, setWall] = useState<PublicWall | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'done'>('loading');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.rpc('get_public_wall', { p_slug: slug }).then(({ data }) => {
      const w = ((data as PublicWall[] | null) || [])[0];
      if (!w) { setState('missing'); return; }
      setWall(w);
      setState('ready');
    });
  }, [slug]);

  function pickFile(f: File | null) {
    setErr('');
    if (!f) { setFile(null); return; }
    if (!EXT[f.type]) { setErr('Please choose an MP4, WebM or MOV video.'); setFile(null); return; }
    if (f.size > MAX_BYTES) { setErr('That video is larger than 50 MB. Please record a shorter clip.'); setFile(null); return; }
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (v.duration > 61) { setErr('Please keep the video under 60 seconds.'); setFile(null); }
      else setFile(f);
    };
    v.onerror = () => { URL.revokeObjectURL(url); setFile(f); }; // some formats can't be probed; the server still enforces size and type
    v.src = url;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!wall) return;
    setErr('');
    if (trap) { setState('done'); return; } // honeypot: bots fill hidden fields
    if (!rating) { setErr('Please choose a star rating.'); return; }
    if (!body.trim() && !file) { setErr('Please write something or add a video.'); return; }
    setBusy(true);
    try {
      let path: string | null = null;
      if (file) {
        path = `${wall.id}/${crypto.randomUUID()}.${EXT[file.type]}`;
        const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
        if (up.error) throw up.error;
      }
      const { error } = await supabase.rpc('submit_testimonial', {
        p_slug: slug, p_name: name, p_role: role || null, p_rating: rating, p_body: body || null, p_video_path: path,
      });
      if (error) throw error;
      setState('done');
    } catch (e) {
      setErr(friendly(e));
    } finally {
      setBusy(false);
    }
  }

  if (state === 'loading') return <div className="wrap narrow"><p className="muted" style={{ padding: 40 }}>Loading…</p></div>;
  if (state === 'missing') {
    return (
      <div className="wrap narrow" style={{ paddingTop: 60 }}>
        <h1 style={{ fontSize: '2rem' }}>Page not found</h1>
        <p className="muted" style={{ marginTop: 12 }}>This testimonial link is not valid. Please check the address with the person who sent it.</p>
      </div>
    );
  }
  const accent = wall?.brand_color || '#F2B01E';
  if (state === 'done') {
    return (
      <div className="wrap narrow" style={{ paddingTop: 60 }}>
        <div className="card stack" role="status">
          <h1 style={{ fontSize: '2rem' }}>Thank you!</h1>
          <p>{wall?.thank_you}</p>
        </div>
        {wall?.show_branding && <p className="muted small" style={{ marginTop: 16, textAlign: 'center' }}>Powered by ProofWall</p>}
      </div>
    );
  }

  return (
    <div className="wrap narrow" style={{ paddingTop: 30, paddingBottom: 40 }}>
      <h1 style={{ fontSize: '2rem' }}>Share your experience with {wall?.name}</h1>
      <p className="muted" style={{ margin: '10px 0 20px' }}>It takes less than a minute. Write a few words, add a short video, or both.</p>
      <form className="card stack" onSubmit={submit}>
        <label>Your name
          <input type="text" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label>Your role or company (optional)
          <input type="text" maxLength={80} value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 4 }} id="rl">How would you rate it?</div>
          <div className="rate" role="radiogroup" aria-labelledby="rl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={n + (n === 1 ? ' star' : ' stars')}
                className={n <= rating ? 'on' : ''} style={n <= rating ? { color: accent } : undefined} onClick={() => setRating(n)}>★</button>
            ))}
          </div>
        </div>
        <label>Your testimonial
          <textarea maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What was it like to work with us?" />
        </label>
        <label>Add a video (optional, up to 60 seconds)
          <input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" capture="user"
            onChange={(e) => pickFile(e.target.files?.[0] || null)} />
          {file && <span className="muted small">Selected: {file.name} ({(file.size / 1048576).toFixed(1)} MB)</span>}
        </label>
        <div className="hp" aria-hidden="true">
          <label>Website <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
        </div>
        {err && <div className="msg err" role="alert">{err}</div>}
        <button className="btn" style={{ background: accent }} disabled={busy}>{busy ? (file ? 'Uploading…' : 'Sending…') : 'Send testimonial'}</button>
        <p className="muted small">By submitting, you agree that {wall?.name} may display your testimonial on their website.</p>
      </form>
      {wall?.show_branding && <p className="muted small" style={{ marginTop: 16, textAlign: 'center' }}>Powered by ProofWall</p>}
    </div>
  );
}
