-- Migration: Add task_assignees table for multi-member task assignment

create table if not exists task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (task_id, profile_id)
);

-- (Optional) Migrate existing assignments
insert into task_assignees (task_id, profile_id)
select id as task_id, assigned_to as profile_id from tasks where assigned_to is not null;

-- (Optional) Remove assigned_to from tasks if you want to fully migrate
-- alter table tasks drop column assigned_to;
