import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only protect /dashboard and /run routes
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/run')) {
    return NextResponse.next()
  }

  // Check for supabase auth token in cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/run/:path*']
}
