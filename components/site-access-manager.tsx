'use client';

import { useEffect, useState } from 'react';
import { Globe2, LockKeyhole } from 'lucide-react';

type AccessMode = 'public' | 'password';

export function SiteAccessManager() {
  const [mode, setMode] = useState<AccessMode>('public');
  const [username, setUsername] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch('/api/admin/site-access', { cache: 'no-store' })
      .then(async (response) => ({
        response,
        data: await response.json() as { mode?: AccessMode; username?: string; hasPassword?: boolean; error?: string },
      }))
      .then(({ response, data }) => {
        if (!response.ok) setError(data.error || 'Site access settings could not be loaded.');
        else {
          setMode(data.mode || 'public');
          setUsername(data.username || '');
          setHasPassword(Boolean(data.hasPassword));
        }
        setLoading(false);
      });
  }, []);

  return (
    <section className="site-access-panel">
      <div className="site-access-heading">
        <div><p className="eyebrow">Visitor access</p><h2>Public site</h2><p>Choose whether everyone can see the website or only people with shared preview credentials.</p></div>
        <span className={`access-status ${mode === 'password' ? 'locked' : ''}`}>{mode === 'password' ? 'Private' : 'Public'}</span>
      </div>
      <form className="site-access-form" onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setMessage(''); setError('');
        const form = event.currentTarget;
        const values = new FormData(form);
        const password = String(values.get('password') || '');
        const response = await fetch('/api/admin/site-access', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, username, password }),
        });
        const data = await response.json() as { error?: string };
        if (response.ok) {
          if (password) { setHasPassword(true); form.reset(); }
          setMessage(mode === 'password' ? 'The public site is now private.' : 'The site is now open to everyone.');
        } else setError(data.error || 'Site access settings could not be saved.');
        setBusy(false);
      }}>
        {loading ? <p>Loading access settings…</p> : <>
          <div className="access-mode-grid" role="radiogroup" aria-label="Public site access">
            <label className={mode === 'public' ? 'selected' : ''}>
              <input type="radio" name="mode" value="public" checked={mode === 'public'} onChange={() => { setMode('public'); setMessage(''); setError(''); }} />
              <Globe2 aria-hidden="true" /><strong>Public</strong><span>Anyone can visit the River Wey Canoe website and request a date.</span>
            </label>
            <label className={mode === 'password' ? 'selected' : ''}>
              <input type="radio" name="mode" value="password" checked={mode === 'password'} onChange={() => { setMode('password'); setMessage(''); setError(''); }} />
              <LockKeyhole aria-hidden="true" /><strong>Private</strong><span>Visitors need a shared username and password. The admin remains available.</span>
            </label>
          </div>
          {mode === 'password' && (
            <div className="site-access-credentials">
              <label><span>Preview username</span><input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={64} autoComplete="off" required /></label>
              <label><span>{hasPassword ? 'New password (leave blank to keep current)' : 'Preview password'}</span><input name="password" type="password" minLength={10} autoComplete="new-password" required={!hasPassword} /></label>
            </div>
          )}
          <p className="access-note">Changes normally reach visitors within a few seconds. Your admin session and booking records are unaffected.</p>
          <button className="button button-dark" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save access setting'}</button>
          {message && <output className="access-message">{message}</output>}
          {error && <output className="form-error">{error}</output>}
        </>}
      </form>
    </section>
  );
}
