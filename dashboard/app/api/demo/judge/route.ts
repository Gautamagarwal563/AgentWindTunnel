import { NextRequest, NextResponse } from 'next/server'
import { judge } from '@/lib/judge'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  let body: {
    baseline_prompt: string
    challenger_prompt: string
    inputs: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
  }

  const { baseline_prompt, challenger_prompt, inputs } = body

  if (!baseline_prompt || !challenger_prompt || !inputs?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS_HEADERS })
  }

  // For the demo we don't actually call an LLM to generate outputs —
  // we simulate them using the prompts so the judge can still run.
  // Real runs (via POST /api/runs) receive actual outputs from the SDK.
  const results = await Promise.all(
    inputs.map(async (user_input: string, i: number) => {
      const baseline_output = `[Baseline response to: "${user_input.slice(0, 60)}"]`
      const challenger_output = `[Challenger response to: "${user_input.slice(0, 60)}"]`
      const result = await judge(user_input, baseline_output, challenger_output)
      return {
        id: String(i + 1),
        user_input,
        baseline_output,
        challenger_output,
        score: result.score,
        reasoning: result.reasoning,
      }
    })
  )

  const failed = results.filter(r => r.score === 'worse').length
  const passed = results.filter(r => r.score === 'better').length
  const neutral = results.filter(r => r.score === 'neutral').length
  const regression_rate = results.length > 0 ? failed / results.length : 0
  const verdict = regression_rate > 0.3 ? 'BLOCKED' : 'APPROVED'

  return NextResponse.json({ verdict, passed, failed, neutral, regression_rate, results }, { headers: CORS_HEADERS })
}
