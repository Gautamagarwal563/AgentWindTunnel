-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users,
  name         text not null,
  description  text,
  api_key      text unique not null,
  created_at   timestamptz default now()
);

create table if not exists interactions (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references projects(id) on delete cascade,
  session_id      text,
  user_input      text not null,
  agent_output    text not null,
  prompt_version  text,
  model           text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now()
);

create table if not exists runs (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid references projects(id) on delete cascade,
  name                 text,
  baseline_version     text not null,
  challenger_version   text not null,
  baseline_prompt      text not null,
  challenger_prompt    text not null,
  baseline_model       text,
  challenger_model     text,
  status               text default 'running',
  total_interactions   int default 0,
  passed               int default 0,
  failed               int default 0,
  neutral              int default 0,
  verdict              text,
  threshold            float default 0.3,
  created_at           timestamptz default now(),
  completed_at         timestamptz
);

create table if not exists run_results (
  id                  uuid primary key default gen_random_uuid(),
  run_id              uuid references runs(id) on delete cascade,
  interaction_id      uuid references interactions(id) on delete set null,
  user_input          text not null,
  baseline_output     text not null,
  challenger_output   text not null,
  score               text not null check (score in ('better', 'worse', 'neutral')),
  reasoning           text,
  created_at          timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists projects_user_id_idx         on projects(user_id);
create index if not exists projects_api_key_idx         on projects(api_key);
create index if not exists interactions_project_id_idx  on interactions(project_id);
create index if not exists interactions_session_id_idx  on interactions(session_id);
create index if not exists interactions_created_at_idx  on interactions(created_at);
create index if not exists runs_project_id_idx          on runs(project_id);
create index if not exists runs_status_idx              on runs(status);
create index if not exists runs_created_at_idx          on runs(created_at);
create index if not exists run_results_run_id_idx       on run_results(run_id);
create index if not exists run_results_interaction_id_idx on run_results(interaction_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table projects     enable row level security;
alter table interactions enable row level security;
alter table runs         enable row level security;
alter table run_results  enable row level security;

-- projects: users can only CRUD their own rows
create policy "projects: owner select"
  on projects for select
  using (auth.uid() = user_id);

create policy "projects: owner insert"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "projects: owner update"
  on projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects: owner delete"
  on projects for delete
  using (auth.uid() = user_id);

-- interactions: users can access rows belonging to their projects
create policy "interactions: owner select"
  on interactions for select
  using (
    exists (
      select 1 from projects
      where projects.id = interactions.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "interactions: owner insert"
  on interactions for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = interactions.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "interactions: owner update"
  on interactions for update
  using (
    exists (
      select 1 from projects
      where projects.id = interactions.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "interactions: owner delete"
  on interactions for delete
  using (
    exists (
      select 1 from projects
      where projects.id = interactions.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "interactions: service_role all"
  on interactions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- runs: users can access rows belonging to their projects
create policy "runs: owner select"
  on runs for select
  using (
    exists (
      select 1 from projects
      where projects.id = runs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "runs: owner insert"
  on runs for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = runs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "runs: owner update"
  on runs for update
  using (
    exists (
      select 1 from projects
      where projects.id = runs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "runs: owner delete"
  on runs for delete
  using (
    exists (
      select 1 from projects
      where projects.id = runs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "runs: service_role all"
  on runs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- run_results: users can access rows belonging to their projects (via runs)
create policy "run_results: owner select"
  on run_results for select
  using (
    exists (
      select 1 from runs
      join projects on projects.id = runs.project_id
      where runs.id = run_results.run_id
        and projects.user_id = auth.uid()
    )
  );

create policy "run_results: owner insert"
  on run_results for insert
  with check (
    exists (
      select 1 from runs
      join projects on projects.id = runs.project_id
      where runs.id = run_results.run_id
        and projects.user_id = auth.uid()
    )
  );

create policy "run_results: owner update"
  on run_results for update
  using (
    exists (
      select 1 from runs
      join projects on projects.id = runs.project_id
      where runs.id = run_results.run_id
        and projects.user_id = auth.uid()
    )
  );

create policy "run_results: owner delete"
  on run_results for delete
  using (
    exists (
      select 1 from runs
      join projects on projects.id = runs.project_id
      where runs.id = run_results.run_id
        and projects.user_id = auth.uid()
    )
  );

create policy "run_results: service_role all"
  on run_results for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
