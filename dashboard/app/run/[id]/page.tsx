'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase, type Run, type RunResult } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '…' : str
}

function DonutCenterLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.3em" fontSize="22" fontWeight="700" fill="#f3f4f6">{total}</tspan>
      <tspan x="50%" dy="1.4em" fontSize="11" fill="#6b7280" fontWeight="500">tested</tspan>
    </text>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3.5 py-2 text-xs" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}>
        <span className="font-semibold">{payload[0].name}</span>
        <span className="ml-2" style={{ color: '#9ca3af' }}>{payload[0].value}</span>
      </div>
    )
  }
  return null
}

function ScoreBadge({ score }: { score: 'better' | 'worse' | 'neutral' }) {
  if (score === 'worse') return <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-widest text-[11px] font-bold hover:bg-red-500/15">WORSE</Badge>
  if (score === 'better') return <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 uppercase tracking-widest text-[11px] font-bold hover:bg-green-500/15">BETTER</Badge>
  return <Badge className="uppercase tracking-widest text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>NEUTRAL</Badge>
}

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
      const { data: runData, error: runError } = await supabase.from('runs').select('*').eq('id', runId).single()
      if (runError) throw runError
      setRun(runData)
      const { data: resultsData, error: resultsError } = await supabase.from('run_results').select('*').eq('run_id', runId).order('created_at', { ascending: true })
      if (resultsError) throw resultsError
      setResults(resultsData || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch run data')
    } finally {
      setLoading(false)
    }
  }, [runId])

  useEffect(() => { if (runId) fetchRunData() }, [runId, fetchRunData])
  useEffect(() => {
    if (!run || run.status !== 'running') return
    const interval = setInterval(fetchRunData, 5000)
    return () => clearInterval(interval)
  }, [run, fetchRunData])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#080808' }}>
        <header className="sticky top-0 z-30 border-b px-6 py-3 flex items-center justify-between" style={{ background: 'rgba(8,8,8,0.9)', borderColor: '#111', backdropFilter: 'blur(12px)' }}>
          <Skeleton className="w-32 h-8" style={{ background: '#111' }} />
          <Skeleton className="w-48 h-4" style={{ background: '#111' }} />
          <Skeleton className="w-28 h-8" style={{ background: '#111' }} />
        </header>
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          {[52, 64, 52].map((h, i) => <Skeleton key={i} className={`w-full h-${h} rounded-2xl`} style={{ background: '#111' }} />)}
        </div>
      </div>
    )
  }

  if (error || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="text-center p-10 rounded-2xl max-w-md" style={{ border: '1px solid rgba(239,68,68,0.2)', background: '#0a0a0a' }}>
          <div className="text-4xl mb-4">⚠️</div>
          <p className="font-semibold text-lg text-red-400 mb-2">Failed to load run</p>
          <p className="text-sm mb-8" style={{ color: 'rgba(239,68,68,0.6)' }}>{error || 'Run not found'}</p>
          <Link href="/dashboard" className="text-sm transition-colors" style={{ color: '#888' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#888' }}
          >← Back to all runs</Link>
        </div>
      </div>
    )
  }

  const regressionRate = run.total_interactions > 0 ? Math.round((run.failed / run.total_interactions) * 100) : 0
  const isBlocked = run.verdict === 'BLOCKED'
  const isApproved = run.verdict === 'APPROVED'
  const isRunning = run.status === 'running'
  const chartData = [
    { name: 'Better', value: run.passed },
    { name: 'Worse', value: run.failed },
    { name: 'Neutral', value: run.neutral },
  ].filter(d => d.value > 0)
  const colorMap: Record<string, string> = { Better: '#22c55e', Worse: '#ef4444', Neutral: '#6b7280' }
  const worseResults = results.filter(r => r.score === 'worse')
  const topFailureReason = worseResults[0]?.reasoning ? truncate(worseResults[0].reasoning, 120) : null

  const verdictBg = isBlocked ? 'rgba(239,68,68,0.06)' : isApproved ? 'rgba(34,197,94,0.05)' : '#0a0a0a'
  const verdictBorder = isBlocked ? 'rgba(239,68,68,0.2)' : isApproved ? 'rgba(34,197,94,0.18)' : '#1a1a1a'
  const verdictColor = isBlocked ? '#f87171' : isApproved ? '#4ade80' : '#d1d5db'

  return (
    <div className="min-h-screen" style={{ background: '#080808', color: '#f3f4f6' }}>

      {/* Topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3"
        style={{ background: 'rgba(8,8,8,0.92)', borderBottom: '1px solid #111', backdropFilter: 'blur(16px)' }}>
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-70 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-xs">WT</div>
          <span className="text-sm font-bold text-white hidden sm:block">Agent Windtunnel</span>
        </Link>
        <nav className="flex items-center gap-2 text-xs min-w-0 flex-1 justify-center" style={{ color: '#555' }}>
          <Link href="/dashboard" className="transition-colors hover:text-gray-300 shrink-0">Runs</Link>
          <span style={{ color: '#333' }}>/</span>
          <span className="truncate font-medium" style={{ color: '#d1d5db' }}>{run.name || run.id}</span>
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          {isRunning && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />Live
            </span>
          )}
          <Link href="/dashboard">
            <button className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ border: '1px solid #1a1a1a', color: '#888' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#1a1a1a' }}
            >← Back to Runs</button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">

        {/* Verdict Banner */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="rounded-2xl p-8 md:p-10 overflow-hidden relative"
          style={{ background: verdictBg, border: `1px solid ${verdictBorder}` }}
        >
          {/* Background icon */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] opacity-5 select-none pointer-events-none">
            {isBlocked ? '🚫' : isApproved ? '✅' : isRunning ? '⏳' : '➖'}
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-10 relative">
            <div className="flex-1 min-w-0">
              <div className="text-5xl mb-4 select-none">{isBlocked ? '🚫' : isApproved ? '✅' : isRunning ? '⏳' : '➖'}</div>
              <h2 className="font-black tracking-tight mb-3 leading-none text-4xl" style={{ color: verdictColor }}>
                {isBlocked ? 'DEPLOY BLOCKED' : isApproved ? 'DEPLOY APPROVED' : isRunning ? 'RUN IN PROGRESS' : 'DEPLOY NEUTRAL'}
              </h2>
              <p className="text-base leading-relaxed max-w-lg" style={{ color: isBlocked ? 'rgba(248,113,113,0.75)' : isApproved ? 'rgba(74,222,128,0.75)' : 'rgba(209,213,219,0.6)' }}>
                {isBlocked
                  ? `The challenger prompt performed worse on ${run.failed}/${run.total_interactions} interactions. Deployment was prevented.`
                  : isApproved
                  ? `The challenger prompt improved or matched quality on ${run.passed + run.neutral}/${run.total_interactions} interactions. Safe to deploy.`
                  : isRunning
                  ? `Evaluating interactions in real time — ${run.total_interactions} processed so far.`
                  : `No significant quality change detected across all ${run.total_interactions} interactions.`}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[280px] shrink-0">
              {[
                { label: 'Regressions', value: run.failed, color: run.failed > 0 ? '#ef4444' : '#6b7280', bg: run.failed > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: run.failed > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)' },
                { label: 'Improvements', value: run.passed, color: run.passed > 0 ? '#22c55e' : '#6b7280', bg: run.passed > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: run.passed > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)' },
                { label: 'Neutral', value: run.neutral, color: '#6b7280', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' },
                { label: 'Regression Rate', value: `${regressionRate}%`, color: regressionRate >= 30 ? '#ef4444' : regressionRate > 0 ? '#f59e0b' : '#22c55e', bg: regressionRate >= 30 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: regressionRate >= 30 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.07, ease }}
                  className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <p className="text-3xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-1.5 uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Donut + Explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}
            className="lg:col-span-2 rounded-2xl p-5 flex flex-col" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#555' }}>Result Distribution</p>
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                      {chartData.map(entry => <Cell key={entry.name} fill={colorMap[entry.name] || '#6b7280'} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <DonutCenterLabel total={run.total_interactions} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm" style={{ color: '#555' }}>No data yet</p>}
            </div>
            <div className="flex items-center justify-center gap-5 mt-3">
              {[{ label: 'Better', color: '#22c55e', value: run.passed }, { label: 'Worse', color: '#ef4444', value: run.failed }, { label: 'Neutral', color: '#6b7280', value: run.neutral }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-xs" style={{ color: '#6b7280' }}>{l.label} <span className="font-semibold" style={{ color: '#9ca3af' }}>{l.value}</span></span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5, ease }}
            className="lg:col-span-3 rounded-2xl p-5 flex flex-col" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#555' }}>What this means</p>
            <p className="text-lg font-semibold leading-relaxed mb-4" style={{ color: isBlocked ? '#fca5a5' : isApproved ? '#86efac' : '#d1d5db' }}>
              {isBlocked ? `Your new prompt degraded quality in ${run.failed} out of ${run.total_interactions} real user conversations.`
                : isApproved ? `Your new prompt improved or maintained quality across all ${run.total_interactions} tested conversations.`
                : isRunning ? 'Evaluation in progress. Results updating in real time.'
                : `Your new prompt produced equivalent quality across all tested conversations.`}
            </p>
            {isBlocked && topFailureReason && (
              <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#ef4444' }}>Most common failure</p>
                <p className="text-sm italic leading-relaxed" style={{ color: '#9ca3af' }}>&ldquo;{topFailureReason}&rdquo;</p>
              </div>
            )}
            {isApproved && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#22c55e' }}>Recommendation</p>
                <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                  The challenger prompt is ready for production. No quality regressions were detected.
                  {run.passed > 0 && ` It outperformed the baseline on ${run.passed} interaction${run.passed > 1 ? 's' : ''}.`}
                </p>
              </div>
            )}
            {run.total_interactions > 0 && (
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between text-[10px] font-mono mb-2" style={{ color: '#555' }}>
                  <span>0%</span><span style={{ color: '#444' }}>quality distribution</span><span>100%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex gap-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {run.passed > 0 && <div className="h-full rounded-l-full bg-green-500" style={{ width: `${(run.passed / run.total_interactions) * 100}%` }} />}
                  {run.neutral > 0 && <div className="h-full bg-gray-500" style={{ width: `${(run.neutral / run.total_interactions) * 100}%` }} />}
                  {run.failed > 0 && <div className="h-full rounded-r-full bg-red-500" style={{ width: `${(run.failed / run.total_interactions) * 100}%` }} />}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Prompt Diff */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest shrink-0" style={{ color: '#555' }}>Prompt Diff</h3>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Baseline', version: run.baseline_version, model: run.baseline_model, prompt: run.baseline_prompt, accent: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)' },
              { label: 'Challenger', version: run.challenger_version, model: run.challenger_model, prompt: run.challenger_prompt, accent: isBlocked ? '#f87171' : '#c084fc', bg: isBlocked ? 'rgba(239,68,68,0.07)' : 'rgba(168,85,247,0.06)', border: isBlocked ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.15)' },
            ].map(card => (
              <div key={card.label} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid #111', background: card.bg }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: card.accent }}>{card.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${card.accent}18`, color: card.accent }}>{card.version}</span>
                    {card.model && <span className="text-xs hidden sm:block" style={{ color: '#555' }}>{card.model}</span>}
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-words overflow-y-auto max-h-48 rounded-lg p-4" style={{ color: '#9ca3af', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {card.prompt}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interaction Analysis */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest shrink-0" style={{ color: '#555' }}>Interaction Analysis</h3>
            {results.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full tabular-nums" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>{results.length}</span>
            )}
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
            {results.length > 0 && (
              <span className="text-xs" style={{ color: '#555' }}>
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
                <motion.div key={result.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: isWorse ? 'rgba(239,68,68,0.04)' : isBetter ? 'rgba(34,197,94,0.03)' : '#0a0a0a',
                    border: isWorse ? '1px solid rgba(239,68,68,0.18)' : isBetter ? '1px solid rgba(34,197,94,0.15)' : '1px solid #1a1a1a',
                    borderLeft: isWorse ? '3px solid rgba(239,68,68,0.6)' : isBetter ? '3px solid rgba(34,197,94,0.5)' : '3px solid transparent',
                  }}>
                  <button className="w-full text-left px-5 py-4 flex items-start sm:items-center justify-between gap-4 transition-colors hover:bg-white/[0.02]"
                    onClick={() => setExpandedRow(isExpanded ? null : result.id)}>
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-mono w-7 text-right shrink-0 pt-0.5 sm:pt-0" style={{ color: '#444' }}>#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#e5e7eb' }}>{truncate(result.user_input, 80)}</p>
                        {result.reasoning && <p className="text-xs italic truncate mt-0.5" style={{ color: '#555' }}>{truncate(result.reasoning, 90)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ScoreBadge score={result.score} />
                      <span className="text-xs select-none transition-transform duration-300 inline-block" style={{ color: '#555', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="px-5 py-3 flex items-center gap-2.5" style={{ background: 'rgba(96,165,250,0.07)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#60a5fa' }}>Baseline</span>
                              <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>{run.baseline_version}</span>
                            </div>
                            <div className="p-5"><p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#d1d5db' }}>{result.baseline_output}</p></div>
                          </div>
                          <div className="flex flex-col">
                            <div className="px-5 py-3 flex items-center gap-2.5" style={{ background: isWorse ? 'rgba(239,68,68,0.08)' : isBetter ? 'rgba(34,197,94,0.07)' : 'rgba(168,85,247,0.06)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isWorse ? '#f87171' : isBetter ? '#4ade80' : '#c084fc' }}>Challenger</span>
                              <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>{run.challenger_version}</span>
                            </div>
                            <div className="p-5" style={{ background: isWorse ? 'rgba(239,68,68,0.025)' : isBetter ? 'rgba(34,197,94,0.02)' : 'transparent' }}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#d1d5db' }}>{result.challenger_output}</p>
                            </div>
                          </div>
                        </div>
                        {result.reasoning && (
                          <div className="px-6 py-5 flex gap-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <span className="text-base shrink-0 mt-0.5">💡</span>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#555' }}>Judge Reasoning</p>
                              <p className="text-sm italic leading-relaxed" style={{ color: '#9ca3af' }}>&ldquo;{result.reasoning}&rdquo;</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {results.length === 0 && (
              <div className="rounded-xl py-20 text-center" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <div className="text-4xl mb-4 opacity-30">{isRunning ? '⏳' : '📭'}</div>
                <p className="text-sm" style={{ color: '#555' }}>{isRunning ? 'Waiting for first interaction results…' : 'No results found for this run.'}</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs" style={{ color: '#3b3b4b' }}>
            <span>Run ID: <span style={{ color: '#555' }}>{run.id}</span></span>
            <span style={{ color: '#2a2a3a' }}>|</span>
            <span>Created: <span style={{ color: '#555' }}>{formatDate(run.created_at)}</span></span>
            {run.completed_at && (<><span style={{ color: '#2a2a3a' }}>|</span><span>Completed: <span style={{ color: '#555' }}>{formatDate(run.completed_at)}</span></span></>)}
          </div>
        </footer>
      </div>
    </div>
  )
}
