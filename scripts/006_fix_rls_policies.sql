-- Drop existing problematic policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Only admins can insert materials" on public.materials;
drop policy if exists "Only admins can update materials" on public.materials;
drop policy if exists "Only admins can delete materials" on public.materials;
drop policy if exists "Admins can view all loans" on public.loans;
drop policy if exists "Admins can update loans" on public.loans;
drop policy if exists "Admins can manage all loan items" on public.loan_items;

-- Create a function to check if user is admin (without recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- Recreate profiles policies without recursion
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    -- Allow if user is viewing their own profile OR if they are an admin
    auth.uid() = id or public.is_admin()
  );

-- Recreate materials policies
create policy "Only admins can insert materials"
  on public.materials for insert
  with check (public.is_admin());

create policy "Only admins can update materials"
  on public.materials for update
  using (public.is_admin());

create policy "Only admins can delete materials"
  on public.materials for delete
  using (public.is_admin());

-- Recreate loans policies
create policy "Admins can view all loans"
  on public.loans for select
  using (
    auth.uid() = student_id or public.is_admin()
  );

create policy "Admins can update loans"
  on public.loans for update
  using (public.is_admin());

-- Recreate loan_items policies
create policy "Admins can manage all loan items"
  on public.loan_items for all
  using (public.is_admin());

-- Grant execute permission on the function
grant execute on function public.is_admin() to authenticated;
