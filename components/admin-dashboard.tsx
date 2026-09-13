'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, ExternalLink, LockKeyhole, LogOut, Mail, Phone, Search, UsersRound, X } from 'lucide-react';
import type { Booking, BookingStatus } from '@/lib/supabase';
import { SiteAccessManager } from '@/components/site-access-manager';

const filters = [
  ['upcoming', 'Upcoming'], ['new', 'New enquiries'], ['confirmed', 'Confirmed'], ['past', 'Past'], ['all', 'All'],
] as const;
const statuses: BookingStatus[] = ['NEW', 'CONTACTED', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'COMPLETED'];
const occasionNames: Record<string, string> = { family: 'Family', couple: 'Couple', friends: 'Friends', celebration: 'Celebration', corporate: 'Corporate', other: 'Other' };

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'bookings' | 'access'>('bookings');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/bookings?filter=${encodeURIComponent(filter)}&search=${encodeURIComponent(search)}`, { cache: 'no-store' });
    if (response.status === 401) { setAuthenticated(false); setLoading(false); return; }
    const result = await response.json() as { bookings?: Booking[] };
    setAuthenticated(true);
    setBookings(result.bookings || []);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { void loadBookings(); }, [loadBookings]);

  if (authenticated === false) {
    return (
      <main className="admin-login">
        <form onSubmit={async (event) => {
          event.preventDefault(); setLoginError('');
          const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
          const result = await response.json() as { error?: string };
          if (!response.ok) { setLoginError(result.error || 'Sign in failed.'); return; }
          setEmail(''); setPassword(''); setAuthenticated(true); void loadBookings();
        }}>
          <div className="wordmark admin-mark"><span>River Wey</span><strong>Canoe</strong></div>
          <p className="eyebrow">Guide’s log</p><h1>Bookings</h1><p>Sign in to see enquiries and manage the public site.</p>
          <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" autoFocus required /></label>
          <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          <button className="button button-dark" type="submit">Open bookings</button>
          {loginError && <output className="form-error">{loginError}</output>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header"><div><div className="wordmark admin-mark"><span>River Wey</span><strong>Canoe</strong></div><h1>{view === 'bookings' ? 'Bookings' : 'Site access'}</h1></div><button className="icon-button" aria-label="Sign out" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); setAuthenticated(false); }}><LogOut /></button></header>
      <nav className="admin-section-tabs" aria-label="Admin sections">
        <button className={view === 'bookings' ? 'active' : ''} onClick={() => setView('bookings')}><CalendarDays /> Bookings</button>
        <button className={view === 'access' ? 'active' : ''} onClick={() => setView('access')}><LockKeyhole /> Site access</button>
        <a href="/" target="_blank" rel="noreferrer">View site <ExternalLink /></a>
      </nav>
      {view === 'bookings' ? <>
        <section className="admin-toolbar">
          <div className="admin-filters">{filters.map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
          <label className="admin-search"><Search size={18} /><span className="sr-only">Search bookings</span><input placeholder="Name, email or phone" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        </section>
        <section className="booking-list" aria-busy={loading}>
          <div className="booking-list-head"><span>Date</span><span>Customer</span><span>Group</span><span>Occasion</span><span>Status</span></div>
          {loading ? <p className="admin-empty">Loading enquiries…</p> : bookings.length === 0 ? <p className="admin-empty">No bookings match this view.</p> : bookings.map((booking) => (
            <button className="booking-row" key={booking.id} onClick={() => { setSelected(booking); setNotice(''); }}>
              <span>{formatDate(booking.preferred_date)}</span><strong>{booking.customer_name}</strong><span>{booking.group_size}</span><span>{booking.occasion_type ? occasionNames[booking.occasion_type] : '—'}</span><span><i className={`status-dot status-${booking.status.toLowerCase()}`} />{booking.status.replace('_', ' ')}</span>
            </button>
          ))}
        </section>
      </> : <SiteAccessManager />}
      {selected && (
        <div className="booking-drawer-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}>
          <aside className="booking-drawer" aria-label={`Booking for ${selected.customer_name}`}>
            <button className="icon-button drawer-close" aria-label="Close booking" onClick={() => setSelected(null)}><X /></button>
            <p className="eyebrow">{selected.status}</p><h2>{selected.customer_name}</h2><p className="drawer-date">{formatDate(selected.preferred_date)}</p>
            <div className="drawer-actions"><a className="button button-dark" href={`tel:${selected.customer_phone}`}><Phone size={17} /> Call</a><a className="button button-outline" href={`mailto:${selected.customer_email}`}><Mail size={17} /> Email</a></div>
            <dl className="booking-details">
              <div><dt><UsersRound size={17} /> Group</dt><dd>{selected.group_size} guests · {selected.occasion_type ? occasionNames[selected.occasion_type] : 'Not specified'}</dd></div>
              <div><dt><CalendarDays size={17} /> Preferred</dt><dd>{formatDate(selected.preferred_date)}</dd></div>
              <div><dt>Alternative</dt><dd>{selected.alternative_date ? formatDate(selected.alternative_date) : 'Not given'}</dd></div>
              <div><dt>Phone</dt><dd>{selected.customer_phone}</dd></div><div><dt>Email</dt><dd>{selected.customer_email}</dd></div>
              {selected.company_name && <div><dt>Company</dt><dd>{selected.company_name}</dd></div>}
              {selected.message && <div className="detail-message"><dt>Message</dt><dd>{selected.message}</dd></div>}
            </dl>
            <form className="admin-update" onSubmit={async (event) => {
              event.preventDefault(); setSaving(true); setNotice('');
              const values = Object.fromEntries(new FormData(event.currentTarget));
              const response = await fetch(`/api/admin/bookings/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: values.status, adminNotes: values.adminNotes }) });
              const result = await response.json() as { booking?: Booking; error?: string };
              setSaving(false); if (!response.ok || !result.booking) { setNotice(result.error || 'Could not save.'); return; }
              setSelected(result.booking); setNotice('Saved.'); void loadBookings();
            }}>
              <label><span>Status</span><select name="status" defaultValue={selected.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label><span>Private notes</span><textarea name="adminNotes" defaultValue={selected.admin_notes || ''} rows={5} maxLength={5000} /></label>
              <button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>{notice && <output>{notice}</output>}
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
