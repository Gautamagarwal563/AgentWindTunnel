'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase, type Run, type RunResult } from '@/lib/supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '…' : str
}

// ─── Custom Donut Center Label ──────────────────────────────────────────────

function DonutCenterLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.3em" fontSize="22" fontWeight="700" fill="#f3f4f6">
        {total}
      </tspan>
      <tspan x="50%" dy="1.4em" fontSize="11" fill="#6b7280" fontWeight="500">
        tested
      </tspan>
    </text>
  )
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0D1117',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '8px 14px',
          fontSize: 12,
          color: '#e5e7eb',
        }}
      >
        <span style={{ fontWeight: 600 }}>{payload[0].name}</span>
        <span style={{ marginLeft: 8, color: '#9ca3af' }}>{payload[0].value}</span>
      </div>
    )
  }
  return null
}

// ─── Score Badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: 'better' | 'worse' | 'neutral' }) {
  if (score === 'worse')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-widest">
        ❌ WORSE
      </span>
    )
  if (score === 'better')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 uppercase tracking-widest">
        ✅ BETTER
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/[0.06] text-gray-400 border border-white/[0.08] uppercase tracking-widest">
      ➖ NEUTRAL
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RunDetailPage() {
  const params = useParams()
  const runId = params.id as string

  const [run, setRun] = useState<Run | null>(null)
  const [results, setResults] = useState<RunResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const fetchRunData = useCallback(async () => {
    try {
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .select('*')
        .eq('id', runId)
        .single()

      if (runError) throw runError
      setRun(runData)

      const { data: resultsData, error: resultsError } = await supabase
        .from('run_results')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true })

      if (resultsError) throw resultsError
      setResults(resultsData || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch run data')
    } finally {
      setLoading(false)
    }
  }, [runId])

  useEffect(() => {
    if (runId) fetchRunData()
  }, [runId, fetchRunData])

  useEffect(() => {
    if (!run || run.status !== 'running') return
    const interval = setInterval(fetchRunData, 5000)
    return () => clearInterval(interval)
  }, [run, fetchRunData])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#080B14' }}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-sm font-medium tracking-wide">Loading analysis</p>
            <p className="text-gray-600 text-xs mt-1">Fetching run data…</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error || !run) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#080B14' }}
      >
        <div
          className="rounded-2xl p-10 text-center max-w-md w-full mx-4"
          style={{
            background: '#0D1117',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 font-semibold text-lg mb-2">Failed to load run</p>
          <p className="text-red-400/60 text-sm mb-8">{error || 'Run not found'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors font-medium"
          >
            ← Back to all runs
          </Link>
        </div>
      </div>
    )
  }

  // ── Derived State ──────────────────────────────────────────────────────────

  const regressionRate =
    run.total_interactions > 0
      ? Math.round((run.failed / run.total_interactions) * 100)
      : 0

  const isBlocked = run.verdict === 'BLOCKED'
  const isApproved = run.verdict === 'APPROVED'
  const isRunning = run.status === 'running'

  const chartData = [
    { name: 'Better', value: run.passed },
    { name: 'Worse', value: run.failed },
    { name: 'Neutral', value: run.neutral },
  ].filter((d) => d.value > 0)

  const chartColors = ['#22c55e', '#ef4444', '#6b7280']
  const colorMap: Record<string, string> = {
    Better: '#22c55e',
    Worse: '#ef4444',
    Neutral: '#6b7280',
  }

  // Top failure reason from judge notes
  const worseResults = results.filter((r) => r.score === 'worse')
  const topFailureReason = worseResults[0]?.reasoning
    ? truncate(worseResults[0].reasoning, 120)
    : null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-gray-100" style={{ background: '#080B14' }}>

      {/* ── Sticky Top Bar ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: 'rgba(8,11,20,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-500/20">
              WT
            </div>
            <span className="text-sm font-bold text-white hidden sm:block">Agent Windtunnel</span>
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 min-w-0 flex-1 justify-center">
            <Link href="/" className="hover:text-gray-300 transition-colors shrink-0">
              Runs
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-300 truncate font-medium">
              {run.name || run.id}
            </span>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            {isRunning && (
              <span className="hidden sm:inline-flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Live
              </span>
            )}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ← Back to Runs
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* ── Breadcrumb text line ──────────────────────────────────────────── */}
        <div className="text-xs text-gray-600 font-mono">
          Agent Windtunnel &nbsp;›&nbsp; Runs &nbsp;›&nbsp;
          <span className="text-gray-400">{run.name || run.id}</span>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VERDICT HERO BANNER                                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section
          className="rounded-2xl overflow-hidden relative"
          style={
            isBlocked
              ? {
                  background: 'linear-gradient(to right, rgba(69,10,10,0.6), rgba(69,10,10,0.2))',
                  border: '1px solid rgba(239,68,68,0.2)',
                }
              : isApproved
              ? {
                  background: 'linear-gradient(to right, rgba(5,46,22,0.6), rgba(5,46,22,0.2))',
                  border: '1px solid rgba(34,197,94,0.2)',
                }
              : {
                  background: 'linear-gradient(to right, rgba(20,20,40,0.6), rgba(20,20,40,0.2))',
                  border: '1px solid rgba(255,255,255,0.06)',
                }
          }
        >
          {/* Glow blob */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isBlocked
                ? 'radial-gradient(ellipse at 10% 50%, rgba(239,68,68,0.08) 0%, transparent 60%)'
                : isApproved
                ? 'radial-gradient(ellipse at 10% 50%, rgba(34,197,94,0.08) 0%, transparent 60%)'
                : 'radial-gradient(ellipse at 10% 50%, rgba(168,85,247,0.06) 0%, transparent 60%)',
            }}
          />

          <div className="relative p-8 md:p-10 flex flex-col lg:flex-row items-start gap-10">
            {/* Left: Verdict */}
            <div className="flex-1 min-w-0">
              <div className="text-8xl leading-none mb-6 select-none">
                {isBlocked ? '🚫' : isApproved ? '✅' : isRunning ? '⏳' : '➖'}
              </div>
              <h2
                className="font-black tracking-tight mb-3 leading-none"
                style={{
                  fontSize: '3rem',
                  color: isBlocked ? '#f87171' : isApproved ? '#4ade80' : '#d1d5db',
                  textShadow: isBlocked
                    ? '0 0 60px rgba(239,68,68,0.3)'
                    : isApproved
                    ? '0 0 60px rgba(34,197,94,0.3)'
                    : 'none',
                }}
              >
                {isBlocked
                  ? 'DEPLOY BLOCKED'
                  : isApproved
                  ? 'DEPLOY APPROVED'
                  : isRunning
                  ? 'RUN IN PROGRESS'
                  : 'DEPLOY NEUTRAL'}
              </h2>
              <p
                className="text-base leading-relaxed max-w-lg"
                style={{
                  color: isBlocked
                    ? 'rgba(252,165,165,0.75)'
                    : isApproved
                    ? 'rgba(134,239,172,0.75)'
                    : 'rgba(209,213,219,0.6)',
                }}
              >
                {isBlocked
                  ? `The challenger prompt performed worse on ${run.failed}/${run.total_interactions} interactions. Deployment was prevented.`
                  : isApproved
                  ? `The challenger prompt improved or matched quality on ${run.passed + run.neutral}/${run.total_interactions} interactions. Safe to deploy.`
                  : isRunning
                  ? `Evaluating interactions in real time — ${run.total_interactions} processed so far.`
                  : `No significant quality change detected across all ${run.total_interactions} interactions.`}
              </p>
            </div>

            {/* Right: 2×2 metric grid */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[300px] shrink-0">
              {/* Regressions */}
              <div
                className="rounded-xl p-5 text-center"
                style={{
                  background: run.failed > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                  border: run.failed > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-4xl font-black text-red-400 tabular-nums">{run.failed}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                  Regressions
                </p>
              </div>

              {/* Improvements */}
              <div
                className="rounded-xl p-5 text-center"
                style={{
                  background: run.passed > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                  border: run.passed > 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-4xl font-black text-green-400 tabular-nums">{run.passed}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                  Improvements
                </p>
              </div>

              {/* Neutral */}
              <div
                className="rounded-xl p-5 text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-4xl font-black text-gray-400 tabular-nums">{run.neutral}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                  Neutral
                </p>
              </div>

              {/* Regression Rate */}
              <div
                className="rounded-xl p-5 text-center"
                style={{
                  background:
                    regressionRate >= 30
                      ? 'rgba(239,68,68,0.08)'
                      : regressionRate > 0
                      ? 'rgba(234,179,8,0.05)'
                      : 'rgba(34,197,94,0.05)',
                  border:
                    regressionRate >= 30
                      ? '1px solid rgba(239,68,68,0.2)'
                      : regressionRate > 0
                      ? '1px solid rgba(234,179,8,0.15)'
                      : '1px solid rgba(34,197,94,0.15)',
                }}
              >
                <p
                  className="text-4xl font-black tabular-nums"
                  style={{
                    color:
                      regressionRate >= 30
                        ? '#f87171'
                        : regressionRate > 0
                        ? '#facc15'
                        : '#4ade80',
                  }}
                >
                  {regressionRate}%
                </p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                  Regression Rate
                </p>
                <p className="text-[9px] text-gray-700 mt-1 font-mono">threshold: 30%</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DONUT + SUMMARY                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Donut (2/5) */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 flex flex-col"
            style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Result Distribution
            </p>
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={colorMap[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <DonutCenterLabel total={run.total_interactions} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-600 text-sm">No data yet</div>
              )}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-5 mt-3">
              {[
                { label: 'Better', color: '#22c55e', value: run.passed },
                { label: 'Worse', color: '#ef4444', value: run.failed },
                { label: 'Neutral', color: '#6b7280', value: run.neutral },
              ].map(({ label, color, value }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-xs text-gray-500">
                    {label}
                    <span className="ml-1 text-gray-400 font-semibold">{value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary (3/5) */}
          <div
            className="lg:col-span-3 rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                What this means
              </p>
              <p
                className="text-lg font-semibold leading-relaxed mb-4"
                style={{
                  color: isBlocked ? '#fca5a5' : isApproved ? '#86efac' : '#d1d5db',
                }}
              >
                {isBlocked
                  ? `Your new prompt degraded quality in ${run.failed} out of ${run.total_interactions} real user conversations.`
                  : isApproved
                  ? `Your new prompt improved or maintained quality across all ${run.total_interactions} tested conversations.`
                  : isRunning
                  ? `Evaluation in progress. Results updating in real time.`
                  : `Your new prompt produced equivalent quality across all tested conversations.`}
              </p>
              {isBlocked && topFailureReason && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-widest mb-2">
                    Most common failure
                  </p>
                  <p className="text-sm text-gray-400 italic leading-relaxed">
                    &ldquo;{topFailureReason}&rdquo;
                  </p>
                </div>
              )}
              {isApproved && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(34,197,94,0.06)',
                    border: '1px solid rgba(34,197,94,0.15)',
                  }}
                >
                  <p className="text-[11px] font-semibold text-green-500 uppercase tracking-widest mb-2">
                    Recommendation
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    The challenger prompt is ready for production. No quality regressions were detected.
                    {run.passed > 0 && ` It outperformed the baseline on ${run.passed} interaction${run.passed > 1 ? 's' : ''}.`}
                  </p>
                </div>
              )}
            </div>
            {/* Mini stat bar */}
            {run.total_interactions > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono mb-2">
                  <span>0%</span>
                  <span className="text-gray-500">quality distribution</span>
                  <span>100%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex gap-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {run.passed > 0 && (
                    <div
                      className="h-full rounded-l-full"
                      style={{
                        width: `${(run.passed / run.total_interactions) * 100}%`,
                        background: '#22c55e',
                      }}
                    />
                  )}
                  {run.neutral > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${(run.neutral / run.total_interactions) * 100}%`,
                        background: '#6b7280',
                      }}
                    />
                  )}
                  {run.failed > 0 && (
                    <div
                      className="h-full rounded-r-full"
                      style={{
                        width: `${(run.failed / run.total_interactions) * 100}%`,
                        background: '#ef4444',
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PROMPT DIFF                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Prompt Diff
            </h3>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline */}
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between gap-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📘</span>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Baseline
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs px-2.5 py-1 rounded-md font-semibold"
                    style={{
                      background: 'rgba(59,130,246,0.12)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}
                  >
                    {run.baseline_version}
                  </span>
                  <span className="text-xs text-gray-600 hidden sm:block">{run.baseline_model}</span>
                </div>
              </div>
              <div className="p-4 flex-1">
                <pre
                  className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words overflow-y-auto rounded-lg p-4"
                  style={{
                    maxHeight: '12rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {run.baseline_prompt}
                </pre>
              </div>
            </div>

            {/* Challenger */}
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: isBlocked ? 'rgba(69,10,10,0.15)' : '#0D1117',
                border: isBlocked ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Warning banner for blocked */}
              {isBlocked && (
                <div
                  className="px-5 py-2.5 flex items-center gap-2"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    borderBottom: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <span className="text-sm">⚠️</span>
                  <span className="text-xs font-semibold text-red-400">
                    This prompt was blocked from production
                  </span>
                </div>
              )}
              <div
                className="px-5 py-4 flex items-center justify-between gap-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📙</span>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Challenger
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs px-2.5 py-1 rounded-md font-semibold"
                    style={{
                      background: 'rgba(168,85,247,0.12)',
                      color: '#c084fc',
                      border: '1px solid rgba(168,85,247,0.2)',
                    }}
                  >
                    {run.challenger_version}
                  </span>
                  <span className="text-xs text-gray-600 hidden sm:block">{run.challenger_model}</span>
                </div>
              </div>
              <div className="p-4 flex-1">
                <pre
                  className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words overflow-y-auto rounded-lg p-4"
                  style={{
                    maxHeight: '12rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: isBlocked
                      ? '1px solid rgba(239,68,68,0.08)'
                      : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {run.challenger_prompt}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* INTERACTION ANALYSIS                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Interaction Analysis
            </h3>
            {results.length > 0 && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full tabular-nums"
                style={{
                  background: 'rgba(168,85,247,0.12)',
                  color: '#c084fc',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                {results.length}
              </span>
            )}
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
            {results.length > 0 && (
              <span className="text-xs text-gray-600">
                {run.failed} regression{run.failed !== 1 ? 's' : ''} · {run.passed} improvement{run.passed !== 1 ? 's' : ''} · {run.neutral} neutral
              </span>
            )}
          </div>

          <div className="space-y-2">
            {results.map((result, index) => {
              const isExpanded = expandedRow === result.id
              const isWorse = result.score === 'worse'
              const isBetter = result.score === 'better'

              return (
                <div
                  key={result.id}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: isWorse
                      ? 'rgba(239,68,68,0.04)'
                      : isBetter
                      ? 'rgba(34,197,94,0.03)'
                      : '#0D1117',
                    border: isWorse
                      ? '1px solid rgba(239,68,68,0.18)'
                      : isBetter
                      ? '1px solid rgba(34,197,94,0.15)'
                      : '1px solid rgba(255,255,255,0.06)',
                    borderLeft: isWorse
                      ? '3px solid rgba(239,68,68,0.6)'
                      : isBetter
                      ? '3px solid rgba(34,197,94,0.5)'
                      : '3px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Collapsed header */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-start sm:items-center justify-between gap-4 transition-colors"
                    style={{
                      ['--hover-bg' as string]: 'rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                    onClick={() => setExpandedRow(isExpanded ? null : result.id)}
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <span className="text-gray-700 text-xs font-mono w-7 text-right shrink-0 pt-0.5 sm:pt-0">
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 font-medium truncate">
                          {truncate(result.user_input, 80)}
                        </p>
                        {result.reasoning && (
                          <p className="text-xs text-gray-600 italic truncate mt-0.5">
                            {truncate(result.reasoning, 90)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ScoreBadge score={result.score} />
                      <span
                        className="text-gray-600 text-xs transition-transform duration-300 select-none"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {/* Response columns */}
                      <div
                        className="grid grid-cols-1 md:grid-cols-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {/* Baseline col */}
                        <div
                          className="flex flex-col"
                          style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <div
                            className="px-5 py-3 flex items-center gap-2.5"
                            style={{
                              background: 'rgba(59,130,246,0.07)',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <span className="text-sm">📘</span>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                              Baseline
                            </span>
                            <span
                              className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                background: 'rgba(59,130,246,0.12)',
                                color: '#60a5fa',
                              }}
                            >
                              {run.baseline_version}
                            </span>
                          </div>
                          <div className="p-5">
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {result.baseline_output}
                            </p>
                          </div>
                        </div>

                        {/* Challenger col */}
                        <div className="flex flex-col">
                          <div
                            className="px-5 py-3 flex items-center gap-2.5"
                            style={{
                              background: isWorse
                                ? 'rgba(239,68,68,0.08)'
                                : isBetter
                                ? 'rgba(34,197,94,0.07)'
                                : 'rgba(168,85,247,0.06)',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <span className="text-sm">📙</span>
                            <span
                              className="text-xs font-bold uppercase tracking-widest"
                              style={{
                                color: isWorse ? '#f87171' : isBetter ? '#4ade80' : '#c084fc',
                              }}
                            >
                              Challenger
                            </span>
                            <span
                              className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                background: 'rgba(168,85,247,0.12)',
                                color: '#c084fc',
                              }}
                            >
                              {run.challenger_version}
                            </span>
                          </div>
                          <div
                            className="p-5 flex-1"
                            style={{
                              background: isWorse
                                ? 'rgba(239,68,68,0.025)'
                                : isBetter
                                ? 'rgba(34,197,94,0.02)'
                                : 'transparent',
                            }}
                          >
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {result.challenger_output}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Judge reasoning */}
                      {result.reasoning && (
                        <div
                          className="px-6 py-5 flex gap-4"
                          style={{ background: 'rgba(0,0,0,0.2)' }}
                        >
                          <span className="text-base shrink-0 mt-0.5">💡</span>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                              Judge Reasoning
                            </p>
                            <p className="text-sm text-gray-400 italic leading-relaxed">
                              &ldquo;{result.reasoning}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {results.length === 0 && (
              <div
                className="rounded-2xl py-20 text-center"
                style={{
                  background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="text-4xl mb-4 opacity-30">
                  {isRunning ? '⏳' : '📭'}
                </div>
                <p className="text-gray-600 text-sm">
                  {isRunning ? 'Waiting for first interaction results…' : 'No results found for this run.'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FOOTER                                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <footer
          className="pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-700 font-mono">
            <span>
              Run ID: <span className="text-gray-600">{run.id}</span>
            </span>
            <span className="text-gray-800">|</span>
            <span>
              Created: <span className="text-gray-600">{formatDate(run.created_at)}</span>
            </span>
            {run.completed_at && (
              <>
                <span className="text-gray-800">|</span>
                <span>
                  Completed: <span className="text-gray-600">{formatDate(run.completed_at)}</span>
                </span>
              </>
            )}
          </div>
        </footer>

      </div>
    </div>
  )
}
