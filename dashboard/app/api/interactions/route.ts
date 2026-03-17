import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const apiKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401, headers: CORS_HEADERS })
  }

  const supabase = createAdminClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('api_key', apiKey)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS })
  }

  const { searchParams } = new URL(request.url)

  const limitParam = parseInt(searchParams.get('limit') ?? '10', 10)
  const limit = isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 100)

  const promptVersion = searchParams.get('prompt_version') ?? null

  let query = supabase
    .from('interactions')
    .select('*', { count: 'exact' })
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (promptVersion !== null) {
    query = query.eq('prompt_version', promptVersion)
  }

  const { data: interactions, error: fetchError, count } = await query

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500, headers: CORS_HEADERS })
  }

  return NextResponse.json(
    { interactions: interactions ?? [], total: count ?? 0 },
    { status: 200, headers: CORS_HEADERS }
  )
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const apiKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401, headers: CORS_HEADERS })
  }

  const supabase = createAdminClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('api_key', apiKey)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS })
  }

  let body: {
    session_id?: string
    user_input: string
    agent_output: string
    prompt_version?: string
    model?: string
    metadata?: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS })
  }

  const { data: interaction, error: insertError } = await supabase
    .from('interactions')
    .insert({
      project_id: project.id,
      session_id: body.session_id ?? null,
      user_input: body.user_input,
      agent_output: body.agent_output,
      prompt_version: body.prompt_version ?? null,
      model: body.model ?? null,
      metadata: body.metadata ?? null,
    })
    .select('id, created_at')
    .single()

  if (insertError || !interaction) {
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500, headers: CORS_HEADERS })
  }

  return NextResponse.json(
    { id: interaction.id, created_at: interaction.created_at },
    { status: 201, headers: CORS_HEADERS }
  )
}
