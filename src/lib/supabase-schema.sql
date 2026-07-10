-- Services table
create table services (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in ('solar_package','custom_design','audit_repair','training')),
  name text not null,
  description text,
  base_price_usd numeric,
  zig_price numeric,
  specs jsonb,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Customers table
create table customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null unique,
  email text,
  province text,
  city text,
  suburb text,
  customer_type text default 'residential' check (customer_type in ('residential','commercial','industrial')),
  created_at timestamptz default now()
);

-- Quotes table
create table quotes (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id),
  service_id uuid references services(id),
  service_category text not null,
  config jsonb not null,
  total_usd numeric not null,
  total_zig numeric,
  deposit_usd numeric not null,
  deposit_zig numeric,
  payment_method text,
  payment_status text default 'pending' check (payment_status in ('pending','deposit_paid','fully_paid','refunded')),
  quote_status text default 'pending' check (quote_status in ('pending','approved','scheduled','in_progress','completed','cancelled')),
  quote_id text unique not null,
  pay_after_install boolean default true,
  assigned_to uuid,
  notes text,
  created_at timestamptz default now()
);

-- Payments table
create table payments (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes(id),
  amount_usd numeric not null,
  amount_zig numeric,
  method text not null check (method in ('ecocash','innbucks','bank_transfer','stripe','cash')),
  transaction_ref text,
  proof_url text,
  status text default 'pending' check (status in ('pending','completed','failed','refunded')),
  created_at timestamptz default now()
);

-- Training enrollments
create table training_enrollments (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id),
  intake_date date not null,
  payment_status text default 'pending',
  attendance_week1 boolean default false,
  attendance_week2 boolean default false,
  certificate_issued boolean default false,
  certificate_url text,
  created_at timestamptz default now()
);

-- Install schedules
create table install_schedules (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes(id),
  schedule_date date not null,
  installer_name text,
  installer_phone text,
  status text default 'scheduled' check (status in ('scheduled','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Admin users
create table admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  role text default 'staff' check (role in ('admin','manager','staff')),
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Exchange rates
create table exchange_rates (
  id uuid default gen_random_uuid() primary key,
  rate numeric not null,
  source text default 'rbz',
  created_at timestamptz default now()
);

-- RLS Policies
alter table services enable row level security;
alter table customers enable row level security;
alter table quotes enable row level security;
alter table payments enable row level security;
alter table training_enrollments enable row level security;
alter table install_schedules enable row level security;
alter table admin_users enable row level security;

create policy "Services public read" on services for select using (true);
create policy "Customers view own" on customers for select using (auth.uid() = id);
create policy "Customers insert own" on customers for insert with check (auth.uid() = id);
create policy "Admins all customers" on customers for all using (auth.role() = 'admin');
create policy "Customers view own quotes" on quotes for select using (customer_id = auth.uid());
create policy "Admins all quotes" on quotes for all using (auth.role() = 'admin');
create policy "Admins only" on admin_users for all using (auth.role() = 'admin');

-- Indexes
create index idx_quotes_customer on quotes(customer_id);
create index idx_quotes_status on quotes(quote_status);
create index idx_quotes_created on quotes(created_at desc);
create index idx_payments_quote on payments(quote_id);
create index idx_schedules_date on install_schedules(schedule_date);
