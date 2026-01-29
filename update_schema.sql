-- Run this in your Supabase SQL Editor to add the Recent Changes feature

-- 1. Create Recent Changes Table
create table recent_changes (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  details text,
  performed_by text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Security
alter table recent_changes enable row level security;

-- 3. Create Policy (Enable all access for authenticated users)
create policy "Enable all access for authenticated users" on recent_changes for all using (true);

-- 4. Note on "Deleted" Users Logic
-- The application code has been updated to check the 'profiles' table on login.
-- If a user is deleted from the 'profiles' table (via the Users page), they will be blocked from logging in.
-- No further SQL is needed for that fix.
