-- Projects (different agents)
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  api_key text unique default gen_random_uuid()::text,
  created_at timestamptz default now()
);

-- Recorded interactions from production
create table if not exists interactions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  session_id text,
  user_input text not null,
  agent_output text not null,
  prompt_version text default 'v1',
  model text default 'gpt-4o-mini',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Windtunnel test runs
create table if not exists runs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  name text,
  baseline_version text not null,
  challenger_version text not null,
  baseline_prompt text not null,
  challenger_prompt text not null,
  baseline_model text default 'gpt-4o-mini',
  challenger_model text default 'gpt-4o-mini',
  status text default 'pending',
  total_interactions int default 0,
  passed int default 0,
  failed int default 0,
  neutral int default 0,
  verdict text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Individual interaction results per run
create table if not exists run_results (
  id uuid default gen_random_uuid() primary key,
  run_id uuid references runs(id),
  interaction_id uuid references interactions(id),
  user_input text not null,
  baseline_output text not null,
  challenger_output text not null,
  score text not null, -- 'better', 'worse', 'neutral'
  reasoning text,
  created_at timestamptz default now()
);
