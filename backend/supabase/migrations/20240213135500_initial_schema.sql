-- Trigger for automatic updated_at timestamp
create extension if not exists moddatetime schema extensions;

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('locataire', 'proprietaire', 'agence', 'admin')),
  avatar_url text,
  city text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger handle_updated_at before update on public.users
  for each row execute procedure moddatetime (updated_at);

-- Properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) not null,
  type text not null,
  city text not null,
  commune text not null,
  price_gnf bigint not null,
  deposit bigint,
  description text,
  status text default 'active' check (status in ('active', 'inactive', 'archived')),
  images_url text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger handle_updated_at before update on public.properties
  for each row execute procedure moddatetime (updated_at);

-- Leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) not null,
  tenant_id uuid references public.users(id) not null,
  budget_gnf bigint not null,
  status text default 'new' check (status in ('new', 'contacted', 'converted', 'rejected')),
  professional_status text,
  desired_duration text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger handle_updated_at before update on public.leads
  for each row execute procedure moddatetime (updated_at);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) unique not null,
  plan_type text check (plan_type in ('starter', 'pro', 'agency')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text default 'active' check (status in ('active', 'cancelled', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure moddatetime (updated_at);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  amount_gnf bigint not null,
  payment_method text check (payment_method in ('orange_money', 'mtn_momo', 'stripe')),
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  reference text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;

-- Users policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Properties policies
create policy "Public properties are viewable by everyone" on public.properties
  for select using (status = 'active');

create policy "Owners can view all their properties" on public.properties
  for select using (auth.uid() = owner_id);

create policy "Owners can insert their own properties" on public.properties
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update their own properties" on public.properties
  for update using (auth.uid() = owner_id);

-- Leads policies
create policy "Tenants can view their own leads" on public.leads
  for select using (auth.uid() = tenant_id);

create policy "Owners can view leads for their properties" on public.leads
  for select using (exists (
    select 1 from public.properties
    where properties.id = leads.property_id
    and properties.owner_id = auth.uid()
  ));

create policy "Tenants can insert leads" on public.leads
  for insert with check (auth.uid() = tenant_id);

-- Subscriptions policies
create policy "Users can view their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view their own transactions" on public.transactions
  for select using (auth.uid() = user_id);
