-- =========================================================
-- Freerock Investments Solar PWA — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. Services (solar packages, audits, training)
create table if not exists services (
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

-- 2. Customers
create table if not exists customers (
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

-- 3. Quotes
create table if not exists quotes (
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

-- 4. Payments (Paynow transactions)
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes(id),
  amount_usd numeric not null,
  amount_zig numeric,
  method text not null check (method in ('ecocash','innbucks','telecash','bank_transfer','card')),
  paynow_reference text,
  transaction_ref text,
  proof_url text,
  status text default 'pending' check (status in ('pending','completed','failed','refunded')),
  created_at timestamptz default now()
);

-- 5. Training enrollments
create table if not exists training_enrollments (
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

-- 6. Install schedules
create table if not exists install_schedules (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes(id),
  schedule_date date not null,
  installer_name text,
  installer_phone text,
  status text default 'scheduled' check (status in ('scheduled','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- 7. Admin users
create table if not exists admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  role text default 'staff' check (role in ('admin','manager','staff')),
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 8. Exchange rates (RBZ daily rate)
create table if not exists exchange_rates (
  id uuid default gen_random_uuid() primary key,
  rate numeric not null,
  source text default 'rbz',
  created_at timestamptz default now()
);

-- 9. Training intakes
create table if not exists training_intakes (
  id uuid default gen_random_uuid() primary key,
  start_date date not null,
  end_date date not null,
  capacity int not null default 20,
  created_at timestamptz default now()
);

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_quotes_customer on quotes(customer_id);
create index if not exists idx_quotes_status on quotes(quote_status);
create index if not exists idx_quotes_created on quotes(created_at desc);
create index if not exists idx_payments_quote on payments(quote_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_schedules_date on install_schedules(schedule_date);
create index if not exists idx_enrollments_intake on training_enrollments(intake_date);
create index if not exists idx_customers_phone on customers(phone);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table services enable row level security;
alter table customers enable row level security;
alter table quotes enable row level security;
alter table payments enable row level security;
alter table training_enrollments enable row level security;
alter table install_schedules enable row level security;
alter table admin_users enable row level security;
alter table exchange_rates enable row level security;
alter table training_intakes enable row level security;

-- Public: anyone can view active services
drop policy if exists "services_public_read" on services;
create policy "services_public_read" on services for select using (true);

-- Customers: view/insert own data only
drop policy if exists "customers_view_own" on customers;
create policy "customers_view_own" on customers for select using (auth.uid() = id);

drop policy if exists "customers_insert_own" on customers;
create policy "customers_insert_own" on customers for insert with check (auth.uid() = id);

drop policy if exists "customers_update_own" on customers;
create policy "customers_update_own" on customers for update using (auth.uid() = id);

-- Quotes: customers see own, admins see all
drop policy if exists "quotes_view_own" on quotes;
create policy "quotes_view_own" on quotes for select using (customer_id = auth.uid());

drop policy if exists "quotes_insert_own" on quotes;
create policy "quotes_insert_own" on quotes for insert with check (customer_id = auth.uid());

-- Payments: customers see own, admins see all
drop policy if exists "payments_view_own" on payments;
create policy "payments_view_own" on payments for select using (
  exists (select 1 from quotes where quotes.id = payments.quote_id and quotes.customer_id = auth.uid())
);

drop policy if exists "payments_insert" on payments;
create policy "payments_insert" on payments for insert with check (true);

-- Admin: full access for admin_users
drop policy if exists "admin_all_services" on services;
create policy "admin_all_services" on services for all using (auth.role() = 'admin');

drop policy if exists "admin_all_customers" on customers;
create policy "admin_all_customers" on customers for all using (auth.role() = 'admin');

drop policy if exists "admin_all_quotes" on quotes;
create policy "admin_all_quotes" on quotes for all using (auth.role() = 'admin');

drop policy if exists "admin_all_payments" on payments;
create policy "admin_all_payments" on payments for all using (auth.role() = 'admin');

drop policy if exists "admin_all_enrollments" on training_enrollments;
create policy "admin_all_enrollments" on training_enrollments for all using (auth.role() = 'admin');

drop policy if exists "admin_all_schedules" on install_schedules;
create policy "admin_all_schedules" on install_schedules for all using (auth.role() = 'admin');

drop policy if exists "admin_all_rates" on exchange_rates;
create policy "admin_all_rates" on exchange_rates for all using (auth.role() = 'admin');

drop policy if exists "admin_all_intakes" on training_intakes;
create policy "admin_all_intakes" on training_intakes for all using (auth.role() = 'admin');

-- Exchange rates: public read
drop policy if exists "rates_public_read" on exchange_rates;
create policy "rates_public_read" on exchange_rates for select using (true);

-- Training intakes: public read
drop policy if exists "intakes_public_read" on training_intakes;
create policy "intakes_public_read" on training_intakes for select using (true);

-- =========================================================
-- SEED DATA (optional)
-- =========================================================

-- Solar packages
insert into services (category, name, description, base_price_usd, specs, sort_order) values
  ('solar_package', '3.2kVA Solar System', 'Entry-level system for small homes', 1800, '{"kva": 3.2, "inverter": "Felicity Hybrid 3.2kVA", "battery": "48V 100Ah Lithium", "panels": "550W x 4"}', 1),
  ('solar_package', '5.5kVA Solar System', 'Most popular — medium home system', 3200, '{"kva": 5.5, "inverter": "Felicity Hybrid 5.5kVA", "battery": "48V 200Ah Lithium", "panels": "550W x 6"}', 2),
  ('solar_package', '8kVA Solar System', 'Large home or small business', 4800, '{"kva": 8, "inverter": "Felicity Hybrid 8kVA", "battery": "48V 200Ah Lithium x2", "panels": "550W x 8"}', 3),
  ('solar_package', '10kVA Solar System', 'Large home with high consumption', 6200, '{"kva": 10, "inverter": "Felicity Hybrid 10kVA", "battery": "48V 200Ah Lithium x3", "panels": "550W x 10"}', 4),
  ('solar_package', '12kVA Solar System', 'Commercial-grade system', 7800, '{"kva": 12, "inverter": "Felicity Hybrid 12kVA", "battery": "48V 200Ah Lithium x4", "panels": "550W x 12"}', 5)
on conflict do nothing;
