-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  loan_id uuid references public.loans(id) on delete cascade,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

-- Notifications policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- Create indexes
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- Function to create notification
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_loan_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (user_id, type, title, message, loan_id)
  values (p_user_id, p_type, p_title, p_message, p_loan_id)
  returning id into v_notification_id;
  
  return v_notification_id;
end;
$$;

-- Trigger function to create notifications on loan status change
create or replace function public.notify_loan_status_change()
returns trigger
language plpgsql
security definer
as $$
declare
  v_title text;
  v_message text;
begin
  -- Only create notification if status changed
  if (TG_OP = 'UPDATE' and OLD.status = NEW.status) then
    return NEW;
  end if;

  -- Determine notification content based on status
  case NEW.status
    when 'approved' then
      v_title := 'Préstamo Aprobado';
      v_message := 'Tu solicitud de préstamo ha sido aprobada. Puedes recoger los materiales en el laboratorio.';
    when 'rejected' then
      v_title := 'Préstamo Rechazado';
      v_message := 'Tu solicitud de préstamo ha sido rechazada. Revisa las notas del administrador para más información.';
    when 'picked_up' then
      v_title := 'Materiales Recogidos';
      v_message := 'Has recogido los materiales. Recuerda devolverlos en la fecha acordada.';
    when 'returned' then
      v_title := 'Préstamo Completado';
      v_message := 'Has devuelto los materiales exitosamente. Gracias por usar el sistema.';
    when 'overdue' then
      v_title := 'Préstamo Vencido';
      v_message := 'Tu préstamo está vencido. Por favor devuelve los materiales lo antes posible.';
    else
      return NEW;
  end case;

  -- Create notification
  perform public.create_notification(
    NEW.student_id,
    NEW.status,
    v_title,
    v_message,
    NEW.id
  );

  return NEW;
end;
$$;

-- Create trigger for loan status changes
drop trigger if exists on_loan_status_change on public.loans;

create trigger on_loan_status_change
  after insert or update on public.loans
  for each row
  execute function public.notify_loan_status_change();
