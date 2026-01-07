-- Run this in your Supabase SQL Editor

-- 1. Create Clients Table
create table clients (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text,
  email text,
  notes text,
  salesman_id text,
  social_media jsonb,
  website text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Salesmen Table
create table salesmen (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text
);

-- 3. Enable Security (Row Level Security)
alter table clients enable row level security;
alter table salesmen enable row level security;

-- 4. Create Policies (Allow public access for now - can be restricted later)
create policy "Public Access Clients" on clients for all using (true);
create policy "Public Access Salesmen" on salesmen for all using (true);

-- 5. Create Profiles Table (to store extra user info like roles)
-- This links to the Supabase Auth User ID
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  role text default 'staff',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy "Public Access Profiles" on profiles for all using (true);

-- Trigger to create profile on signup (Optional, but good for auto-creation)
-- For now, we will handle profile creation manually in the code to keep it simple.
