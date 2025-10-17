-- Agrega nuevos roles, campo programa, Agenda (salas y reservas) y Reporte de Prácticas

-- 1) Extender roles y agregar campo programa en perfiles
do $$
begin
  -- Agregar columna program si no existe
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'program'
  ) then
    alter table public.profiles
      add column program text check (program in ('mecatronica','manufactura'));
  end if;

  -- Reemplazar constraint de roles para incluir nuevos roles
  begin
    alter table public.profiles drop constraint if exists profiles_role_check;
  exception when undefined_object then
    -- continuar si no existe
    null;
  end;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('student','admin','lab_manager','professor'));
end $$;

-- 2) Funciones helper de roles
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
end; $$ language plpgsql security definer;

create or replace function public.is_lab_manager()
returns boolean as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid() and role = 'lab_manager');
end; $$ language plpgsql security definer;

create or replace function public.is_professor()
returns boolean as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid() and role = 'professor');
end; $$ language plpgsql security definer;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_lab_manager() to authenticated;
grant execute on function public.is_professor() to authenticated;

-- 3) Ajustar préstamos para incluir programa (separación por programa)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'loans' and column_name = 'program'
  ) then
    alter table public.loans add column program text check (program in ('mecatronica','manufactura'));
  end if;
end $$;

-- Políticas: mantener existentes y permitir acceso por programa a lab_manager
do $$
begin
  -- Select
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'loans' and policyname = 'Lab managers can view loans by program'
  ) then
    create policy "Lab managers can view loans by program"
      on public.loans for select
      using (
        public.is_lab_manager() and exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.program = loans.program
        )
      );
  end if;

  -- Update
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'loans' and policyname = 'Lab managers can update loans by program'
  ) then
    create policy "Lab managers can update loans by program"
      on public.loans for update
      using (
        public.is_lab_manager() and exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.program = loans.program
        )
      );
  end if;
end $$;

-- 4) Agenda: salas (laboratorios/salones) y reservas
create table if not exists public.rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  capacity integer,
  type text check (type in ('laboratorio','aula','taller')) not null,
  location text,
  program text check (program in ('mecatronica','manufactura')),
  responsible_id uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

alter table public.rooms enable row level security;

-- RLS para rooms: ver todos, modificar admin; lab_manager solo ve de su programa
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rooms' and policyname='Anyone can view rooms'
  ) then
    create policy "Anyone can view rooms" on public.rooms for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rooms' and policyname='Admins can manage rooms'
  ) then
    create policy "Admins can manage rooms" on public.rooms for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rooms' and policyname='Lab managers view rooms by program'
  ) then
    create policy "Lab managers view rooms by program" on public.rooms for select
      using (
        public.is_lab_manager() and exists (
          select 1 from public.profiles p where p.id = auth.uid() and (rooms.program is null or rooms.program = p.program)
        )
      );
  end if;
end $$;

-- Reservas
create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  program text check (program in ('mecatronica','manufactura')),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending','approved','cancelled')),
  reason text, -- motivo del uso (solicitante)
  cancel_reason text, -- motivo de cancelación (requerido si status = cancelled)
  approved_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

alter table public.reservations enable row level security;

-- Constraint: no traslapes de reservas aprobadas para el mismo room
create or replace function public.no_overlaps_for_approved()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'approved' then
    if exists (
      select 1 from public.reservations r
      where r.room_id = NEW.room_id
        and r.status = 'approved'
        and tstzrange(r.start_time, r.end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)')
        and r.id <> NEW.id
    ) then
      raise exception 'Ya existe una reserva aprobada que se traslapa en este horario';
    end if;
  end if;
  return NEW;
end; $$;

drop trigger if exists reservations_no_overlap on public.reservations;
create trigger reservations_no_overlap
  before insert or update on public.reservations
  for each row execute function public.no_overlaps_for_approved();

-- RLS para reservas
do $$
begin
  -- Ver
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='reservations' and policyname='Students view own and approved reservations by room'
  ) then
    create policy "Students view own and approved reservations by room" on public.reservations for select
      using (
        requested_by = auth.uid()
        or status = 'approved'
      );
  end if;

  -- Crear (estudiantes y profesores pueden solicitar)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='reservations' and policyname='Students and professors can create reservations'
  ) then
    create policy "Students and professors can create reservations" on public.reservations for insert
      with check (
        (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('student','professor')))
      );
  end if;

  -- Lab manager puede ver y aprobar/cancelar de su programa
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='reservations' and policyname='Lab managers manage reservations by program'
  ) then
    create policy "Lab managers manage reservations by program" on public.reservations for all
      using (
        public.is_lab_manager() and exists (
          select 1 from public.profiles p where p.id = auth.uid() and (reservations.program = p.program)
        )
      ) with check (
        public.is_lab_manager() and exists (
          select 1 from public.profiles p where p.id = auth.uid() and (reservations.program = p.program)
        )
      );
  end if;

  -- Admin total
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='reservations' and policyname='Admins manage all reservations'
  ) then
    create policy "Admins manage all reservations" on public.reservations for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- 5) Reporte de Prácticas: aulas, materias y reportes
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  program text not null check (program in ('mecatronica','manufactura')),
  semester integer not null check (semester between 1 and 12),
  created_at timestamp with time zone default now()
);

alter table public.subjects enable row level security;

-- Cualquiera puede ver, solo admin gestiona
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='subjects' and policyname='Anyone can view subjects'
  ) then
    create policy "Anyone can view subjects" on public.subjects for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='subjects' and policyname='Admins manage subjects'
  ) then
    create policy "Admins manage subjects" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Reusar rooms para aulas/laboratorios en reportes
create table if not exists public.practice_reports (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  program text not null check (program in ('mecatronica','manufactura')),
  students_count integer not null check (students_count >= 0),
  practice_name text not null,
  practice_description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table public.practice_reports enable row level security;

-- RLS: profesores gestionan sus reportes, admin ve todo; lab_manager ve por programa
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='practice_reports' and policyname='Professors manage own practice reports'
  ) then
    create policy "Professors manage own practice reports" on public.practice_reports for all
      using (created_by = auth.uid()) with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='practice_reports' and policyname='Admins view all practice reports'
  ) then
    create policy "Admins view all practice reports" on public.practice_reports for select using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='practice_reports' and policyname='Lab managers view practice reports by program'
  ) then
    create policy "Lab managers view practice reports by program" on public.practice_reports for select
      using (
        public.is_lab_manager() and exists (
          select 1 from public.profiles p where p.id = auth.uid() and practice_reports.program = p.program
        )
      );
  end if;
end $$;

-- Índices útiles
create index if not exists idx_reservations_room_time on public.reservations (room_id, start_time, end_time);
create index if not exists idx_reservations_status on public.reservations (status);
create index if not exists idx_loans_program on public.loans (program);
create index if not exists idx_rooms_program on public.rooms (program);
create index if not exists idx_subjects_program on public.subjects (program);
create index if not exists idx_practice_reports_program on public.practice_reports (program);


