-- Create admin user profile
-- Note: You need to create the auth user first in Supabase Auth
-- Email: admin@laboratorio.edu
-- Password: Admin123! (change this after first login)

-- This script will create the profile for the admin user
-- First, you need to sign up with the email admin@laboratorio.edu in the app
-- Then run this script to update the role to admin

-- Update the role of the admin user (replace with actual user_id after signup)
-- You can find the user_id in the Supabase Auth dashboard or by querying auth.users

-- Example: 
-- update public.profiles 
-- set role = 'admin', full_name = 'Administrador del Sistema'
-- where email = 'admin@laboratorio.edu';

-- For now, let's create a function to easily promote users to admin
create or replace function promote_to_admin(user_email text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set role = 'admin'
  where email = user_email;
end;
$$;
select promote_to_admin('admin@laboratorio.edu');
-- Usage: select promote_to_admin('admin@laboratorio.edu');
