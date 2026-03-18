"""
WindTunnel Schema Setup Script

This script applies the database schema to your Supabase project.
It uses the Supabase Management API to run SQL directly.

USAGE:
    Option 1: With a Personal Access Token (PAT)
        Get your PAT from: https://app.supabase.com/account/tokens
        python setup_schema.py --token YOUR_PAT

    Option 2: Manual (copy-paste into Supabase Dashboard SQL Editor)
        1. Go to: https://supabase.com/dashboard/project/ovaaeoufpwwbnymdcdpi/editor
        2. Paste the contents of schema.sql and run it

    Option 3: With database password
        python setup_schema.py --db-password YOUR_DB_PASSWORD
"""

import os
import sys
import argparse
import requests


SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
PROJECT_REF = SUPABASE_URL.split('//')[1].split('.')[0] if SUPABASE_URL else ''
SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

SCHEMA_SQL = """
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
  score text not null,
  reasoning text,
  created_at timestamptz default now()
);
"""


def apply_schema_with_pat(pat: str):
    """Apply schema using Personal Access Token via Supabase Management API."""
    print(f"[INFO] Applying schema using Personal Access Token...")

    headers = {
        'Authorization': f'Bearer {pat}',
        'Content-Type': 'application/json'
    }

    resp = requests.post(
        f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query',
        headers=headers,
        json={'query': SCHEMA_SQL}
    )

    if resp.status_code in (200, 201):
        print("[SUCCESS] Schema applied successfully!")
        return True
    else:
        print(f"[ERROR] Failed to apply schema: {resp.status_code} {resp.text}")
        return False


def apply_schema_with_db_password(db_password: str):
    """Apply schema using direct PostgreSQL connection."""
    try:
        import psycopg2

        # Try different regions
        regions = ['us-east-1', 'us-east-2', 'us-west-2', 'eu-west-1']

        for region in regions:
            host = f'aws-0-{region}.pooler.supabase.com'
            try:
                print(f"[INFO] Trying {host}...")
                conn = psycopg2.connect(
                    host=host,
                    port=5432,
                    database='postgres',
                    user=f'postgres.{PROJECT_REF}',
                    password=db_password,
                    connect_timeout=5,
                    sslmode='require'
                )
                print(f"[INFO] Connected to {host}")
                cur = conn.cursor()
                cur.execute(SCHEMA_SQL)
                conn.commit()
                cur.close()
                conn.close()
                print("[SUCCESS] Schema applied successfully!")
                return True
            except Exception as e:
                print(f"[INFO] {host} failed: {e}")
                continue

        print("[ERROR] Could not connect to any region")
        return False

    except ImportError:
        print("[ERROR] psycopg2 not installed. Run: pip install psycopg2-binary")
        return False


def verify_schema():
    """Verify the schema was applied by checking if tables exist."""
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}'
    }

    tables = ['projects', 'interactions', 'runs', 'run_results']
    all_good = True

    for table in tables:
        resp = requests.get(
            f'{SUPABASE_URL}/rest/v1/{table}?limit=1',
            headers=headers
        )
        if resp.status_code == 200:
            print(f"  ✓ Table '{table}' exists")
        else:
            print(f"  ✗ Table '{table}' not found (status: {resp.status_code})")
            all_good = False

    return all_good


def main():
    parser = argparse.ArgumentParser(description='Setup WindTunnel database schema')
    parser.add_argument('--token', '-t', help='Supabase Personal Access Token')
    parser.add_argument('--db-password', '-p', help='PostgreSQL database password')
    parser.add_argument('--verify', '-v', action='store_true', help='Just verify schema exists')
    args = parser.parse_args()

    print("=" * 60)
    print("  WindTunnel Schema Setup")
    print("=" * 60)

    if args.verify:
        print("\n[INFO] Verifying schema...")
        if verify_schema():
            print("\n[SUCCESS] All tables exist! Schema is ready.")
            return 0
        else:
            print("\n[ERROR] Some tables are missing. Apply the schema first.")
            return 1

    # First check if schema already exists
    print("\n[INFO] Checking if schema already exists...")
    if verify_schema():
        print("\n[SUCCESS] Schema already exists! No action needed.")
        print("[INFO] You can now run the demo: python demo/demo_agent.py")
        return 0

    print("\n[INFO] Schema not found. Applying...")

    success = False

    if args.token:
        success = apply_schema_with_pat(args.token)
    elif args.db_password:
        success = apply_schema_with_db_password(args.db_password)
    else:
        print("\n[INFO] No credentials provided.")
        print("\nTo apply the schema, use ONE of these methods:")
        print()
        print("  METHOD 1 - Personal Access Token (recommended):")
        print("    1. Go to https://app.supabase.com/account/tokens")
        print("    2. Generate a new token")
        print("    3. Run: python setup_schema.py --token YOUR_TOKEN")
        print()
        print("  METHOD 2 - Database Password:")
        print("    1. Go to https://supabase.com/dashboard/project/ovaaeoufpwwbnymdcdpi/settings/database")
        print("    2. Find your database password (or reset it)")
        print("    3. Run: python setup_schema.py --db-password YOUR_PASSWORD")
        print()
        print("  METHOD 3 - Supabase Dashboard SQL Editor (manual):")
        print("    1. Go to: https://supabase.com/dashboard/project/ovaaeoufpwwbnymdcdpi/editor")
        print("    2. Copy and paste the contents of schema.sql")
        print("    3. Click 'Run'")
        print()
        print("The schema SQL file is at: /Users/gautamagarwal/windtunnel/schema.sql")
        return 1

    if success:
        print("\n[INFO] Verifying schema...")
        verify_schema()
        print("\n[SUCCESS] Setup complete!")
        print("[INFO] You can now run the demo: python demo/demo_agent.py")
        return 0
    else:
        print("\n[ERROR] Schema setup failed.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
