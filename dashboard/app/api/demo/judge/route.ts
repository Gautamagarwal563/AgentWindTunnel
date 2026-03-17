import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

// Pre-written realistic customer support Q&A pairs for demo purposes.
// Cycled through based on input index so results always look meaningful.
const DEMO_QA_POOL: Array<{
  user_input: string
  baseline_output: string
  challenger_output: string
  score: 'better' | 'worse' | 'neutral'
  reasoning: string
}> = [
  {
    user_input: 'How do I reset my password?',
    baseline_output: 'To reset your password, go to Settings > Security > Reset Password. You\'ll receive an email with a reset link valid for 24 hours.',
    challenger_output: 'Click "Forgot Password" on the login page and enter your email. We\'ll send you a link.',
    score: 'worse',
    reasoning: 'Challenger omits the Settings path (primary method for logged-in users) and removes the 24-hour validity detail. Baseline is more complete and actionable for both logged-in and logged-out users.',
  },
  {
    user_input: 'What payment methods do you accept?',
    baseline_output: 'We accept Visa, Mastercard, American Express, and PayPal.',
    challenger_output: 'Great question! We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay. Payments are processed securely via Stripe.',
    score: 'worse',
    reasoning: 'Challenger adds Apple Pay and security context, which is better — but the opening "Great question!" is hollow filler that undermines tone. More critically, the baseline doesn\'t mention Apple Pay at all, making it factually incomplete. Challenger regresses on tone while improving on content.',
  },
  {
    user_input: 'Can I export my data?',
    baseline_output: 'Yes, you can export all your data as a CSV or JSON from Account Settings > Data > Export.',
    challenger_output: 'Data export is available on Pro and Enterprise plans. Go to Account Settings > Data > Export to download your data.',
    score: 'worse',
    reasoning: 'Challenger incorrectly restricts data export to paid plans. The baseline correctly conveys that all users can export data. This is a factual regression that could frustrate free-plan users.',
  },
  {
    user_input: 'How long does shipping take?',
    baseline_output: 'Standard shipping takes 5–7 business days. Express shipping is 2–3 business days.',
    challenger_output: 'Shipping typically takes 5–7 business days for standard or 2–3 days for express. International orders may take up to 14 days.',
    score: 'better',
    reasoning: 'Challenger adds useful international shipping information the baseline omits. Both cover domestic times equivalently; the international detail reduces follow-up questions from a significant user segment.',
  },
  {
    user_input: 'Do you offer a free trial?',
    baseline_output: 'Yes, we offer a 14-day free trial with full access and no credit card required.',
    challenger_output: 'We offer a free trial period for new users.',
    score: 'worse',
    reasoning: 'Challenger is vague — it omits the 14-day duration and the key "no credit card required" selling point. Baseline is significantly more persuasive and informative for prospective users evaluating the product.',
  },
]

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

  // Demo mode: return pre-computed realistic results cycling through the pool.
  // We don't call an LLM here — the demo is purely illustrative.
  const results = inputs
    .filter((input: string) => input.trim().length > 0)
    .map((user_input: string, i: number) => {
      const pool = DEMO_QA_POOL[i % DEMO_QA_POOL.length]
      return {
        id: String(i + 1),
        user_input,
        baseline_output: pool.baseline_output,
        challenger_output: pool.challenger_output,
        score: pool.score,
        reasoning: pool.reasoning,
      }
    })

  const failed = results.filter(r => r.score === 'worse').length
  const passed = results.filter(r => r.score === 'better').length
  const neutral = results.filter(r => r.score === 'neutral').length
  const regression_rate = results.length > 0 ? failed / results.length : 0
  const verdict = regression_rate > 0.3 ? 'BLOCKED' : 'APPROVED'

  return NextResponse.json({ verdict, passed, failed, neutral, regression_rate, results }, { headers: CORS_HEADERS })
}
