-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('student', 'admin')),
  student_id text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create materials table
create table if not exists public.materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null,
  total_quantity integer not null default 0,
  available_quantity integer not null default 0,
  location text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on materials
alter table public.materials enable row level security;

-- Materials policies (everyone can view, only admins can modify)
create policy "Anyone can view materials"
  on public.materials for select
  using (true);

create policy "Only admins can insert materials"
  on public.materials for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can update materials"
  on public.materials for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can delete materials"
  on public.materials for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create loans table
create table if not exists public.loans (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  request_date timestamp with time zone default now(),
  expected_pickup_date timestamp with time zone not null,
  expected_return_date timestamp with time zone not null,
  actual_pickup_date timestamp with time zone,
  actual_return_date timestamp with time zone,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'picked_up', 'returned', 'overdue')),
  notes text,
  admin_notes text,
  approved_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on loans
alter table public.loans enable row level security;

-- Loans policies
create policy "Students can view their own loans"
  on public.loans for select
  using (auth.uid() = student_id);

create policy "Students can create loans"
  on public.loans for insert
  with check (auth.uid() = student_id);

create policy "Admins can view all loans"
  on public.loans for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update loans"
  on public.loans for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create loan_items table (many-to-many relationship)
create table if not exists public.loan_items (
  id uuid primary key default uuid_generate_v4(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamp with time zone default now()
);

-- Enable RLS on loan_items
alter table public.loan_items enable row level security;

-- Loan items policies
create policy "Users can view loan items for their loans"
  on public.loan_items for select
  using (
    exists (
      select 1 from public.loans
      where loans.id = loan_items.loan_id
      and (loans.student_id = auth.uid() or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      ))
    )
  );

create policy "Students can insert loan items for their loans"
  on public.loan_items for insert
  with check (
    exists (
      select 1 from public.loans
      where loans.id = loan_items.loan_id
      and loans.student_id = auth.uid()
    )
  );

create policy "Admins can manage all loan items"
  on public.loan_items for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for better performance
create index if not exists idx_loans_student_id on public.loans(student_id);
create index if not exists idx_loans_status on public.loans(status);
create index if not exists idx_loan_items_loan_id on public.loan_items(loan_id);
create index if not exists idx_loan_items_material_id on public.loan_items(material_id);
create index if not exists idx_profiles_role on public.profiles(role);
