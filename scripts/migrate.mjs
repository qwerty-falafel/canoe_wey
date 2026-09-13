import pg from 'pg';

if (!process.env.DIRECT_CONNECTION_STRING) throw new Error('DIRECT_CONNECTION_STRING is missing.');

const client = new pg.Client({ connectionString: process.env.DIRECT_CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(`
    create extension if not exists pgcrypto;

    create table if not exists public.bookings (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      customer_name text not null check (char_length(customer_name) between 1 and 120),
      customer_email text not null check (char_length(customer_email) between 3 and 254),
      customer_phone text not null check (char_length(customer_phone) between 3 and 40),
      preferred_date date not null,
      alternative_date date,
      group_size integer not null check (group_size between 2 and 12),
      occasion_type text check (occasion_type is null or occasion_type in ('family','couple','friends','celebration','corporate','other')),
      company_name text check (company_name is null or char_length(company_name) <= 160),
      message text check (message is null or char_length(message) <= 3000),
      status text not null default 'NEW' check (status in ('NEW','CONTACTED','CONFIRMED','DECLINED','CANCELLED','COMPLETED')),
      admin_notes text check (admin_notes is null or char_length(admin_notes) <= 5000)
    );

    alter table public.bookings enable row level security;
    revoke all on public.bookings from anon, authenticated;

    create or replace function public.set_updated_at()
    returns trigger language plpgsql security invoker set search_path = '' as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$;

    drop trigger if exists bookings_set_updated_at on public.bookings;
    create trigger bookings_set_updated_at before update on public.bookings
      for each row execute function public.set_updated_at();

    create index if not exists bookings_preferred_date_idx on public.bookings (preferred_date);
    create index if not exists bookings_status_idx on public.bookings (status);
  `);
  console.log('Booking schema is ready.');
} finally {
  await client.end();
}
