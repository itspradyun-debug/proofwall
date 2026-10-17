'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { friendly } from '@/lib/util';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/dashboard' },
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/dashboard');
        } else {
          setMsg({ t: 'ok', m: 'Account created. Check your email for a confirmation link, then sign in.' });
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/dashboard');
      }
    } catch (err) {
      setMsg({ t: 'err', m: friendly(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap narrow">
      <header className="top">
        <Link href="/" className="logo"><i aria-hidden="true" />ProofWall</Link>
      </header>
      <div className="card stack" style={{ marginTop: 24 }}>
        <h2>{mode === 'signin' ? 'Sign in' : 'Create your account'}</h2>
        <form className="stack" onSubmit={submit}>
          <label>Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
            <input
              type="password" required minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'signup' && <span className="muted small">At least 8 characters.</span>}
          </label>
          {msg && <div className={'msg ' + msg.t} role="status">{msg.m}</div>}
          <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button
          className="btn ghost small" type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null); }}
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
