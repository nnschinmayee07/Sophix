-- Sophix schema (Neon Postgres). Safe to run repeatedly.

create extension if not exists pgcrypto;

-- USERS (admin accounts). Participants are NOT required to have an account.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin', 'participant')),
  created_at timestamptz default now()
);

-- EVENTS
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  event_type text default 'hackathon',
  event_date date,
  event_time text default '',
  location text default '',
  capacity integer,
  price numeric(10,2) not null default 0,
  currency text not null default 'inr',
  is_paid boolean not null default false,
  is_published boolean not null default false,
  image_url text default '',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ENROLLMENTS
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  participant_name text not null,
  participant_email text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text not null default 'not_required' check (payment_status in ('not_required', 'pending', 'paid', 'failed')),
  payment_link_id text,
  amount_paid numeric(10,2) default 0,
  created_at timestamptz default now(),
  unique (event_id, participant_email)
);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'inr',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz default now()
);

-- ---- Migration from the old legacy schema (name/attendees/engagement) ----
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'events' and column_name = 'name')
     and not exists (select 1 from information_schema.columns where table_name = 'events' and column_name = 'title') then
    alter table events rename column name to title;
  end if;
end $$;

alter table events add column if not exists slug text;
alter table events add column if not exists event_type text default 'hackathon';
alter table events add column if not exists event_time text default '';
alter table events add column if not exists capacity integer;
alter table events add column if not exists price numeric(10,2) not null default 0;
alter table events add column if not exists currency text not null default 'usd';
alter table events add column if not exists is_paid boolean not null default false;
alter table events add column if not exists is_published boolean not null default true;
alter table events add column if not exists image_url text default '';
alter table events add column if not exists created_by uuid references users(id) on delete set null;
alter table events add column if not exists updated_at timestamptz default now();

-- backfill slug for any legacy rows, then enforce uniqueness
update events set slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 8)
where slug is null or slug = '';

alter table events alter column slug set not null;
create unique index if not exists events_slug_key on events(slug);

-- legacy event_date was text; convert to date if needed
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'events' and column_name = 'event_date' and data_type = 'text') then
    alter table events alter column event_date type date using (nullif(event_date, '')::date);
  end if;
end $$;

-- rename Stripe-era columns to provider-neutral names (safe no-op if already renamed)
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'enrollments' and column_name = 'stripe_session_id')
     and not exists (select 1 from information_schema.columns where table_name = 'enrollments' and column_name = 'payment_link_id') then
    alter table enrollments rename column stripe_session_id to payment_link_id;
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'provider_session_id')
     and not exists (select 1 from information_schema.columns where table_name = 'payments' and column_name = 'provider_payment_id') then
    alter table payments rename column provider_session_id to provider_payment_id;
  end if;
end $$;

update payments set provider = 'razorpay' where provider = 'stripe';

create index if not exists idx_events_published on events(is_published);
create index if not exists idx_events_slug on events(slug);
create index if not exists idx_enrollments_event on enrollments(event_id);
create index if not exists idx_payments_enrollment on payments(enrollment_id);

-- migrate legacy participants (name/email/event-name) into enrollments
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'participants') then
    insert into enrollments (event_id, participant_name, participant_email, status, payment_status, created_at)
    select e.id, p.name, p.email, 'confirmed', 'not_required', p.created_at
    from participants p
    join events e on e.title = p.event
    on conflict (event_id, participant_email) do nothing;

    drop table participants;
  end if;
end $$;

-- seed a default admin if no users exist (password: ChangeMe123! — change immediately after first login)
insert into users (name, email, password_hash, role)
select 'Sophix Admin', 'admin@sophix.dev', '$2b$10$Czab8/Qx1NJwMfrKK4RPJeZZ2JAAOvNfxRn/F5XMgsBmqjQj5CdIG', 'admin'
where not exists (select 1 from users);

