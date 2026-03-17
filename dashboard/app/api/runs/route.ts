import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { judge } from '@/lib/judge'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
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
    name?: string
    baseline_version: string
    challenger_version: string
    baseline_prompt?: string
    challenger_prompt?: string
    baseline_model?: string
    challenger_model?: string
    threshold?: number
    interactions: Array<{
      user_input: string
      baseline_output: string
      challenger_output: string
    }>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS })
  }

  if (!body.interactions || !Array.isArray(body.interactions) || body.interactions.length < 1) {
    return NextResponse.json(
      { error: 'interactions array is required and must have at least 1 item' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const threshold = body.threshold ?? 0.3
  const total = body.interactions.length

  const { data: run, error: runInsertError } = await supabase
    .from('runs')
    .insert({
      project_id: project.id,
      name: body.name ?? null,
      baseline_version: body.baseline_version,
      challenger_version: body.challenger_version,
      baseline_prompt: body.baseline_prompt ?? null,
      challenger_prompt: body.challenger_prompt ?? null,
      baseline_model: body.baseline_model ?? null,
      challenger_model: body.challenger_model ?? null,
      status: 'running',
      total_interactions: total,
      passed: 0,
      failed: 0,
      neutral: 0,
      verdict: null,
    })
    .select()
    .single()

  if (runInsertError || !run) {
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500, headers: CORS_HEADERS })
  }

  let passed = 0
  let failed = 0
  let neutral = 0

  const results = []

  for (const interaction of body.interactions) {
    const judgeResult = await judge(
      interaction.user_input,
      interaction.baseline_output,
      interaction.challenger_output
    )

    if (judgeResult.score === 'better') {
      passed++
    } else if (judgeResult.score === 'worse') {
      failed++
    } else {
      neutral++
    }

    const { data: result, error: resultInsertError } = await supabase
      .from('run_results')
      .insert({
        run_id: run.id,
        interaction_id: null,
        user_input: interaction.user_input,
        baseline_output: interaction.baseline_output,
        challenger_output: interaction.challenger_output,
        score: judgeResult.score,
        reasoning: judgeResult.reasoning,
      })
      .select()
      .single()

    if (!resultInsertError && result) {
      results.push(result)
    }
  }

  const regression_rate = failed / total
  const verdict = regression_rate > threshold ? 'BLOCKED' : 'APPROVED'
  const completed_at = new Date().toISOString()

  const { data: updatedRun, error: updateError } = await supabase
    .from('runs')
    .update({
      status: 'completed',
      passed,
      failed,
      neutral,
      verdict,
      completed_at,
    })
    .eq('id', run.id)
    .select()
    .single()

  if (updateError || !updatedRun) {
    return NextResponse.json({ error: 'Failed to finalize run' }, { status: 500, headers: CORS_HEADERS })
  }

  if (verdict === 'BLOCKED') {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${baseUrl}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') ?? '',
      },
      body: JSON.stringify({
        run_id: run.id,
        verdict,
        regression_rate,
        run_name: body.name ?? null,
        project_name: null,
      }),
    }).catch(() => {})
  }

  return NextResponse.json(
    { ...updatedRun, regression_rate, results },
    { status: 200, headers: CORS_HEADERS }
  )
}
