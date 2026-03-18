-- Run this in your Supabase SQL editor

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attendees integer default 0,
  engagement integer default 0,
  created_at timestamptz default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  event text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional but recommended)
alter table events enable row level security;
alter table participants enable row level security;

-- Allow public read/write for now (tighten later with auth)
create policy "Allow all" on events for all using (true) with check (true);
create policy "Allow all" on participants for all using (true) with check (true);
