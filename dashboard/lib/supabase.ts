import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Run = {
  id: string
  project_id: string
  name: string | null
  baseline_version: string
  challenger_version: string
  baseline_prompt: string
  challenger_prompt: string
  baseline_model: string
  challenger_model: string
  status: string
  total_interactions: number
  passed: number
  failed: number
  neutral: number
  verdict: string | null
  created_at: string
  completed_at: string | null
}

export type RunResult = {
  id: string
  run_id: string
  interaction_id: string
  user_input: string
  baseline_output: string
  challenger_output: string
  score: 'better' | 'worse' | 'neutral'
  reasoning: string | null
  created_at: string
}

export type Project = {
  id: string
  name: string
  description: string | null
  api_key: string
  created_at: string
}
