import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

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
    .select('id, user_id, name')
    .eq('api_key', apiKey)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS })
  }

  let body: {
    run_id: string
    verdict: string
    regression_rate: number
    run_name?: string
    project_name?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS })
  }

  if (body.verdict !== 'BLOCKED') {
    return NextResponse.json({ sent: false, reason: 'Only BLOCKED verdicts trigger notifications' }, { headers: CORS_HEADERS })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ sent: false, reason: 'RESEND_API_KEY not configured' }, { headers: CORS_HEADERS })
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(project.user_id)

  if (userError || !userData?.user?.email) {
    return NextResponse.json({ error: 'Could not resolve project owner email' }, { status: 500, headers: CORS_HEADERS })
  }

  const ownerEmail = userData.user.email
  const runName = body.run_name ?? `Run ${body.run_id}`
  const projectName = body.project_name ?? project.name ?? 'your project'
  const regressionPct = `${(body.regression_rate * 100).toFixed(1)}%`
  const runUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://windtunnel.ai'}/run/${body.run_id}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Windtunnel blocked your deploy</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid #1a1a1a;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#fff;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                    <span style="font-size:13px;font-weight:700;color:#000;">WT</span>
                  </td>
                  <td style="padding-left:12px;font-size:14px;font-weight:600;color:#fff;">Windtunnel</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status badge -->
          <tr>
            <td style="padding:28px 32px 0;">
              <span style="display:inline-block;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#ef4444;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">Deploy Blocked</span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:14px 32px 0;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;letter-spacing:-0.02em;">Your deploy was blocked</h1>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td style="padding:12px 32px 24px;">
              <p style="margin:0;font-size:14px;color:#666;line-height:1.65;">
                Windtunnel detected a prompt regression in <strong style="color:#aaa;">${projectName}</strong> and blocked the deploy to protect your users.
              </p>
            </td>
          </tr>

          <!-- Stats card -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #1e1e1e;border-radius:10px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:14px;border-bottom:1px solid #1a1a1a;">
                          <span style="font-size:11px;font-weight:600;color:#444;letter-spacing:0.06em;text-transform:uppercase;">Run</span><br/>
                          <span style="font-size:14px;color:#ccc;margin-top:4px;display:inline-block;">${runName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:14px;">
                          <span style="font-size:11px;font-weight:600;color:#444;letter-spacing:0.06em;text-transform:uppercase;">Regression Rate</span><br/>
                          <span style="font-size:28px;font-weight:600;color:#ef4444;margin-top:4px;display:inline-block;letter-spacing:-0.02em;">${regressionPct}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="${runUrl}" style="display:inline-block;background:#0A5CF5;color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;letter-spacing:-0.01em;">View run details →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #111;">
              <p style="margin:0;font-size:12px;color:#333;line-height:1.6;">
                You received this email because you own a Windtunnel project. Review your prompt changes and fix the regression before redeploying.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const emailPayload = {
    from: 'Windtunnel <noreply@windtunnel.ai>',
    to: [ownerEmail],
    subject: `🚫 Windtunnel blocked your deploy — ${runName}`,
    html,
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  })

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text()
    console.error('Resend API error:', resendError)
    return NextResponse.json(
      { error: 'Failed to send email', detail: resendError },
      { status: 502, headers: CORS_HEADERS }
    )
  }

  const resendData = await resendResponse.json()

  return NextResponse.json(
    { sent: true, email_id: resendData.id, to: ownerEmail },
    { headers: CORS_HEADERS }
  )
}
