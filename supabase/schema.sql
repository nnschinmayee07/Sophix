-- Run this in your Neon SQL editor to upgrade the schema

-- Add new columns to events (safe to run even if table exists)
ALTER TABLE events ADD COLUMN IF NOT EXISTS description text default '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS location text default '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date text default '';

-- Recreate events from scratch if you prefer a clean slate:
-- DROP TABLE IF EXISTS participants;
-- DROP TABLE IF EXISTS events;

-- create table events (
--   id uuid primary key default gen_random_uuid(),
--   name text not null,
--   description text default '',
--   location text default '',
--   event_date text default '',
--   attendees integer default 0,
--   engagement integer default 0,
--   created_at timestamptz default now()
-- );

-- create table participants (
--   id uuid primary key default gen_random_uuid(),
--   name text not null,
--   email text not null,
--   event text not null,
--   created_at timestamptz default now()
-- );
