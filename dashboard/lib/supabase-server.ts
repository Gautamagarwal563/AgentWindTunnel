import { createClient } from '@supabase/supabase-js'

// Server-side admin client — bypasses RLS for API routes
// Uses service role key (never expose to browser)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
