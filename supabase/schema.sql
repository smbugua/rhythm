-- Luna Period Tracker Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  user_id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cycle entries table
create table public.cycle_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  entry_date date not null,
  entry_type text not null check (entry_type in ('period_start', 'period_end')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily logs table for mood and symptoms
create table public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  mood integer check (mood >= 1 and mood <= 5),
  energy integer check (energy >= 1 and energy <= 5),
  symptoms text[], -- Array of symptom tags
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, log_date)
);

-- Create indexes for better query performance
create index cycle_entries_user_id_idx on public.cycle_entries(user_id);
create index cycle_entries_entry_date_idx on public.cycle_entries(entry_date);
create index daily_logs_user_id_idx on public.daily_logs(user_id);
create index daily_logs_log_date_idx on public.daily_logs(log_date);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.cycle_entries enable row level security;
alter table public.daily_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Cycle entries policies
create policy "Users can view own entries"
  on public.cycle_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.cycle_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.cycle_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.cycle_entries for delete
  using (auth.uid() = user_id);

-- Daily logs policies
create policy "Users can view own daily logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily logs"
  on public.daily_logs for delete
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
