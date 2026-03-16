'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase, type Run, type RunResult } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Custom Donut Center Label ───────────────────────────────────────────────

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

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number }[]
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-gray-200">
        <span className="font-semibold">{payload[0].name}</span>
        <span className="ml-2 text-gray-400">{payload[0].value}</span>
      </div>
    )
  }
  return null
}

// ─── Score Badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: 'better' | 'worse' | 'neutral' }) {
  if (score === 'worse')
    return (
      <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-widest text-[11px] font-bold hover:bg-red-500/15">
        ❌ WORSE
      </Badge>
    )
  if (score === 'better')
    return (
      <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 uppercase tracking-widest text-[11px] font-bold hover:bg-green-500/15">
        ✅ BETTER
      </Badge>
    )
  return (
    <Badge className="bg-white/[0.06] text-gray-400 border border-white/[0.08] uppercase tracking-widest text-[11px] font-bold hover:bg-white/[0.06]">
      ➖ NEUTRAL
    </Badge>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#02040a]">
      {/* Topbar skeleton */}
      <header className="sticky top-0 z-30 bg-[#02040a]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Skeleton className="w-32 h-8 bg-white/[0.06]" />
          <Skeleton className="w-48 h-4 bg-white/[0.06]" />
          <Skeleton className="w-28 h-8 bg-white/[0.06]" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Verdict banner skeleton */}
        <Skeleton className="w-full h-52 rounded-2xl bg-white/[0.04]" />

        {/* Two-col skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Skeleton className="lg:col-span-2 h-64 rounded-2xl bg-white/[0.04]" />
          <Skeleton className="lg:col-span-3 h-64 rounded-2xl bg-white/[0.04]" />
        </div>

        {/* Prompt diff skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-52 rounded-2xl bg-white/[0.04]" />
          <Skeleton className="h-52 rounded-2xl bg-white/[0.04]" />
        </div>

        {/* Interaction analysis skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-16 rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  // ── Error ───────────────────────────────────────────────────────────────────

  if (error || !run) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <Card className="bg-[#0a0d14] border-red-500/20 max-w-md w-full mx-4">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-semibold text-lg mb-2">Failed to load run</p>
            <p className="text-red-400/60 text-sm mb-8">{error || 'Run not found'}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors font-medium"
            >
              ← Back to all runs
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Derived State ────────────────────────────────────────────────────────────

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

  const colorMap: Record<string, string> = {
    Better: '#22c55e',
    Worse: '#ef4444',
    Neutral: '#6b7280',
  }

  const worseResults = results.filter((r) => r.score === 'worse')
  const topFailureReason = worseResults[0]?.reasoning
    ? truncate(worseResults[0].reasoning, 120)
    : null

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#02040a] text-gray-100">

      {/* ── Topbar ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#02040a]/85 backdrop-blur-md border-b border-white/[0.06]">
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

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            {isRunning && (
              <Badge className="hidden sm:inline-flex gap-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Live
              </Badge>
            )}
            <Button variant="outline" size="sm" className="border-white/[0.08] bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-xs">
              <Link href="/">← Back to Runs</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* ── Verdict Banner ────────────────────────────────────────────────────── */}
        <Card
          className={
            isBlocked
              ? 'bg-gradient-to-r from-red-950/40 to-transparent border-red-500/20 overflow-hidden'
              : isApproved
              ? 'bg-gradient-to-r from-green-950/40 to-transparent border-green-500/20 overflow-hidden'
              : 'bg-[#0a0d14] border-white/[0.06] overflow-hidden'
          }
        >
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col lg:flex-row items-start gap-10">

              {/* Left: Verdict identity */}
              <div className="flex-1 min-w-0">
                <div className="text-7xl leading-none mb-6 select-none">
                  {isBlocked ? '🚫' : isApproved ? '✅' : isRunning ? '⏳' : '➖'}
                </div>
                <h2
                  className={`font-black tracking-tight mb-3 leading-none text-4xl ${
                    isBlocked
                      ? 'text-red-400'
                      : isApproved
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}
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
                  className={`text-base leading-relaxed max-w-lg ${
                    isBlocked
                      ? 'text-red-300/75'
                      : isApproved
                      ? 'text-green-300/75'
                      : 'text-gray-300/60'
                  }`}
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

              {/* Right: 2x2 stat sub-cards */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[300px] shrink-0">
                {/* Regressions */}
                <Card
                  className={
                    run.failed > 0
                      ? 'bg-red-500/[0.08] border-red-500/20 text-center'
                      : 'bg-white/[0.03] border-white/[0.06] text-center'
                  }
                >
                  <CardContent className="p-5">
                    <p className="text-4xl font-black text-red-400 tabular-nums">{run.failed}</p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                      Regressions
                    </p>
                  </CardContent>
                </Card>

                {/* Improvements */}
                <Card
                  className={
                    run.passed > 0
                      ? 'bg-green-500/[0.08] border-green-500/20 text-center'
                      : 'bg-white/[0.03] border-white/[0.06] text-center'
                  }
                >
                  <CardContent className="p-5">
                    <p className="text-4xl font-black text-green-400 tabular-nums">{run.passed}</p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                      Improvements
                    </p>
                  </CardContent>
                </Card>

                {/* Neutral */}
                <Card className="bg-white/[0.03] border-white/[0.06] text-center">
                  <CardContent className="p-5">
                    <p className="text-4xl font-black text-gray-400 tabular-nums">{run.neutral}</p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                      Neutral
                    </p>
                  </CardContent>
                </Card>

                {/* Regression Rate */}
                <Card
                  className={
                    regressionRate >= 30
                      ? 'bg-red-500/[0.08] border-red-500/20 text-center'
                      : regressionRate > 0
                      ? 'bg-yellow-500/[0.05] border-yellow-500/15 text-center'
                      : 'bg-green-500/[0.05] border-green-500/15 text-center'
                  }
                >
                  <CardContent className="p-5">
                    <p
                      className={`text-4xl font-black tabular-nums ${
                        regressionRate >= 30
                          ? 'text-red-400'
                          : regressionRate > 0
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}
                    >
                      {regressionRate}%
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">
                      Regression Rate
                    </p>
                    <p className="text-[9px] text-gray-700 mt-1 font-mono">threshold: 30%</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Donut + Explanation ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Donut chart (2/5) */}
          <Card className="lg:col-span-2 bg-[#0a0d14] border-white/[0.06] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Result Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
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
                  <p className="text-gray-600 text-sm">No data yet</p>
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
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-gray-500">
                      {label}
                      <span className="ml-1 text-gray-400 font-semibold">{value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What this means (3/5) */}
          <Card className="lg:col-span-3 bg-[#0a0d14] border-white/[0.06] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                What this means
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p
                  className={`text-lg font-semibold leading-relaxed mb-4 ${
                    isBlocked
                      ? 'text-red-300'
                      : isApproved
                      ? 'text-green-300'
                      : 'text-gray-300'
                  }`}
                >
                  {isBlocked
                    ? `Your new prompt degraded quality in ${run.failed} out of ${run.total_interactions} real user conversations.`
                    : isApproved
                    ? `Your new prompt improved or maintained quality across all ${run.total_interactions} tested conversations.`
                    : isRunning
                    ? 'Evaluation in progress. Results updating in real time.'
                    : `Your new prompt produced equivalent quality across all tested conversations.`}
                </p>

                {isBlocked && topFailureReason && (
                  <div className="rounded-xl p-4 bg-red-500/[0.06] border border-red-500/15">
                    <p className="text-[11px] font-semibold text-red-500 uppercase tracking-widest mb-2">
                      Most common failure
                    </p>
                    <p className="text-sm text-gray-400 italic leading-relaxed">
                      &ldquo;{topFailureReason}&rdquo;
                    </p>
                  </div>
                )}

                {isApproved && (
                  <div className="rounded-xl p-4 bg-green-500/[0.06] border border-green-500/15">
                    <p className="text-[11px] font-semibold text-green-500 uppercase tracking-widest mb-2">
                      Recommendation
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The challenger prompt is ready for production. No quality regressions were detected.
                      {run.passed > 0 &&
                        ` It outperformed the baseline on ${run.passed} interaction${run.passed > 1 ? 's' : ''}.`}
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
                  <div className="h-2 rounded-full overflow-hidden flex gap-0.5 bg-white/[0.04]">
                    {run.passed > 0 && (
                      <div
                        className="h-full rounded-l-full bg-green-500"
                        style={{ width: `${(run.passed / run.total_interactions) * 100}%` }}
                      />
                    )}
                    {run.neutral > 0 && (
                      <div
                        className="h-full bg-gray-500"
                        style={{ width: `${(run.neutral / run.total_interactions) * 100}%` }}
                      />
                    )}
                    {run.failed > 0 && (
                      <div
                        className="h-full rounded-r-full bg-red-500"
                        style={{ width: `${(run.failed / run.total_interactions) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Prompt Diff ───────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Prompt Diff
            </h3>
            <Separator className="flex-1 bg-white/[0.04]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline */}
            <Card className="bg-[#0a0d14] border-white/[0.06] overflow-hidden flex flex-col">
              <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📘</span>
                    <CardTitle className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Baseline
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="font-mono bg-blue-500/12 text-blue-400 border border-blue-500/20 hover:bg-blue-500/12">
                      {run.baseline_version}
                    </Badge>
                    <span className="text-xs text-gray-600 hidden sm:block">{run.baseline_model}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <pre className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words overflow-y-auto rounded-lg p-4 max-h-48 bg-black/30 border border-white/[0.04]">
                  {run.baseline_prompt}
                </pre>
              </CardContent>
            </Card>

            {/* Challenger */}
            <Card
              className={
                isBlocked
                  ? 'bg-red-950/15 border-red-500/15 overflow-hidden flex flex-col'
                  : 'bg-[#0a0d14] border-white/[0.06] overflow-hidden flex flex-col'
              }
            >
              {isBlocked && (
                <div className="px-5 py-2.5 flex items-center gap-2 bg-red-500/10 border-b border-red-500/15">
                  <span className="text-sm">⚠️</span>
                  <span className="text-xs font-semibold text-red-400">
                    This prompt was blocked from production
                  </span>
                </div>
              )}
              <CardHeader className="px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📙</span>
                    <CardTitle className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Challenger
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="font-mono bg-purple-500/12 text-purple-400 border border-purple-500/20 hover:bg-purple-500/12">
                      {run.challenger_version}
                    </Badge>
                    <span className="text-xs text-gray-600 hidden sm:block">{run.challenger_model}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <pre
                  className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words overflow-y-auto rounded-lg p-4 max-h-48 bg-black/30"
                  style={{
                    border: isBlocked
                      ? '1px solid rgba(239,68,68,0.08)'
                      : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {run.challenger_prompt}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Interaction Analysis ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Interaction Analysis
            </h3>
            {results.length > 0 && (
              <Badge className="bg-purple-500/12 text-purple-400 border border-purple-500/20 tabular-nums hover:bg-purple-500/12">
                {results.length}
              </Badge>
            )}
            <Separator className="flex-1 bg-white/[0.04]" />
            {results.length > 0 && (
              <span className="text-xs text-gray-600">
                {run.failed} regression{run.failed !== 1 ? 's' : ''} · {run.passed}{' '}
                improvement{run.passed !== 1 ? 's' : ''} · {run.neutral} neutral
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
                      : '#0a0d14',
                    border: isWorse
                      ? '1px solid rgba(239,68,68,0.18)'
                      : isBetter
                      ? '1px solid rgba(34,197,94,0.15)'
                      : '1px solid rgba(255,255,255,0.06)',
                    borderLeft: isWorse
                      ? '3px solid rgba(239,68,68,0.6)'
                      : isBetter
                      ? '3px solid rgba(34,197,94,0.5)'
                      : '3px solid transparent',
                  }}
                >
                  {/* Collapsed header row */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
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
                        className="text-gray-600 text-xs select-none transition-transform duration-300 inline-block"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.05]">
                      {/* Response columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/[0.05]">
                        {/* Baseline column */}
                        <div className="flex flex-col border-r border-white/[0.05]">
                          <div className="px-5 py-3 flex items-center gap-2.5 bg-blue-500/[0.07] border-b border-white/[0.04]">
                            <span className="text-sm">📘</span>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                              Baseline
                            </span>
                            <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/12 text-blue-400">
                              {run.baseline_version}
                            </span>
                          </div>
                          <div className="p-5">
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {result.baseline_output}
                            </p>
                          </div>
                        </div>

                        {/* Challenger column */}
                        <div className="flex flex-col">
                          <div
                            className="px-5 py-3 flex items-center gap-2.5 border-b border-white/[0.04]"
                            style={{
                              background: isWorse
                                ? 'rgba(239,68,68,0.08)'
                                : isBetter
                                ? 'rgba(34,197,94,0.07)'
                                : 'rgba(168,85,247,0.06)',
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
                            <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-500/12 text-purple-400">
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

                      {/* Judge reasoning — full width */}
                      {result.reasoning && (
                        <div className="px-6 py-5 flex gap-4 bg-black/20">
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
              <Card className="bg-[#0a0d14] border-white/[0.06]">
                <CardContent className="py-20 text-center">
                  <div className="text-4xl mb-4 opacity-30">{isRunning ? '⏳' : '📭'}</div>
                  <p className="text-gray-600 text-sm">
                    {isRunning
                      ? 'Waiting for first interaction results…'
                      : 'No results found for this run.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <footer className="pt-6 border-t border-white/[0.04]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-slate-700">
            <span>
              Run ID: <span className="text-slate-600">{run.id}</span>
            </span>
            <span className="text-slate-800">|</span>
            <span>
              Created: <span className="text-slate-600">{formatDate(run.created_at)}</span>
            </span>
            {run.completed_at && (
              <>
                <span className="text-slate-800">|</span>
                <span>
                  Completed: <span className="text-slate-600">{formatDate(run.completed_at)}</span>
                </span>
              </>
            )}
          </div>
        </footer>

      </div>
    </div>
  )
}
