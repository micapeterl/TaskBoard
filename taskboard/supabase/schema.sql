-- ============================================================
-- TaskBoard — Supabase Schema
-- Run this in your Supabase SQL Editor (project > SQL Editor > New query)
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ─── LABELS ──────────────────────────────────────────────────
create table if not exists labels (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#6366f1',
  created_at  timestamptz default now()
);

alter table labels enable row level security;

create policy "Users manage own labels"
  on labels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── TASKS ───────────────────────────────────────────────────
create table if not exists tasks (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  status        text not null default 'todo'
                  check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority      text not null default 'normal'
                  check (priority in ('low', 'normal', 'high')),
  due_date      date,
  position      integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users manage own tasks"
  on tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure update_updated_at();

-- ─── TASK_LABELS (junction) ───────────────────────────────────
create table if not exists task_labels (
  task_id   uuid not null references tasks(id) on delete cascade,
  label_id  uuid not null references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

alter table task_labels enable row level security;

-- Allow access if user owns the task
create policy "Users manage task labels for own tasks"
  on task_labels for all
  using (
    exists (
      select 1 from tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- ─── COMMENTS ────────────────────────────────────────────────
create table if not exists comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references tasks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);

alter table comments enable row level security;

create policy "Users manage own comments"
  on comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can read comments on tasks they own
create policy "Users read comments on own tasks"
  on comments for select
  using (
    exists (
      select 1 from tasks
      where tasks.id = comments.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- ─── ACTIVITY LOG ────────────────────────────────────────────
create table if not exists activity_log (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references tasks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,   -- 'status_change' | 'edit' | 'comment' | 'created'
  payload     jsonb,            -- { from, to, field, ... }
  created_at  timestamptz default now()
);

alter table activity_log enable row level security;

create policy "Users manage own activity"
  on activity_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read activity on own tasks"
  on activity_log for select
  using (
    exists (
      select 1 from tasks
      where tasks.id = activity_log.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- ============================================================
-- After running this, go to:
-- Authentication > Settings > Enable "Allow anonymous sign-ins"
-- ============================================================
