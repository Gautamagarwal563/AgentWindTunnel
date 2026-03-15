'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase, type Run } from '@/lib/supabase'

// ─── Helpers ────────────────────────────────────────────────────────────────

function regressionRate(run: Run): number {
  if (!run.total_interactions || run.total_interactions === 0) return 0
  return Math.round((run.failed / run.total_interactions) * 100)
}

function regressionColor(rate: number): string {
  if (rate > 30) return '#f87171'   // red-400
  if (rate >= 10) return '#fbbf24'  // amber-400
  return '#4ade80'                  // green-400
}

function regressionTextClass(rate: number): string {
  if (rate > 30) return 'text-red-400'
  if (rate >= 10) return 'text-amber-400'
  return 'text-green-400'
}

function verdictConfig(verdict: string | null) {
  switch (verdict?.toLowerCase()) {
    case 'approved':
      return { label: 'Approved', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' }
    case 'blocked':
      return { label: 'Blocked', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
    case 'pending':
      return { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' }
    default:
      return { label: verdict ?? 'Unknown', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortName(run: Run): string {
  const name = run.name ?? run.id
  return name.length > 18 ? name.slice(0, 16) + '…' : name
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; rate: number } }> }) {
  if (!active || !payload?.length) return null
  const { name, rate } = payload[0].payload
  return (
    <div className="rounded-lg border border-white/10 bg-[#161b22] px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-300 font-medium mb-0.5 truncate max-w-[180px]">{name}</p>
      <p style={{ color: regressionColor(rate) }} className="font-semibold">
        {rate}% regression
      </p>
    </div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-5 animate-pulse">
      <div className="h-3 w-24 rounded bg-white/[0.06] mb-3" />
      <div className="h-7 w-16 rounded bg-white/[0.08]" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/[0.04]">
      {[120, 180, 140, 60, 60, 100, 100, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 rounded bg-white/[0.06] animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  )
}

// ─── Circular Progress ───────────────────────────────────────────────────────

function CircularProgress({ value, color }: { value: number; color: string }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width="40" height="40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} strokeWidth="3" stroke="rgba(255,255,255,0.06)" fill="none" />
      <circle
        cx="20"
        cy="20"
        r={r}
        strokeWidth="3"
        stroke={color}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Nav Item ────────────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  href,
  active,
}: {
  icon: string
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchRuns() {
    const { data } = await supabase
      .from('runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setRuns(data as Run[])
    setLoading(false)
  }

  useEffect(() => {
    fetchRuns()
    const interval = setInterval(fetchRuns, 10_000)
    return () => clearInterval(interval)
  }, [])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalRuns = runs.length
  const blocked = runs.filter((r) => r.verdict?.toLowerCase() === 'blocked').length
  const approved = runs.filter((r) => r.verdict?.toLowerCase() === 'approved').length
  const avgRate =
    runs.length > 0
      ? Math.round(runs.reduce((acc, r) => acc + regressionRate(r), 0) / runs.length)
      : 0

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = [...runs]
    .reverse()
    .slice(-20)
    .map((r) => ({
      name: r.name ?? r.id.slice(0, 8),
      shortName: shortName(r),
      rate: regressionRate(r),
    }))

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-gray-100">
      {/* ── Sidebar ── */}
      <aside className="w-[200px] shrink-0 flex flex-col bg-[#0D1117] border-r border-white/5 py-5">
        {/* Logo */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/20">
              WT
            </div>
            <span className="text-sm font-semibold text-gray-100 tracking-tight">Windtunnel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="🌪️" label="Runs" href="/dashboard" active />
          <NavItem icon="📡" label="Interactions" href="/interactions" />
          <NavItem icon="🔑" label="API Keys" href="/api-keys" />
          <NavItem icon="📚" label="Docs" href="/docs" />
        </nav>

        {/* Version badge */}
        <div className="px-4 mt-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-gray-500 border border-white/[0.06] tracking-wide">
            v0.1.0 beta
          </span>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#030712]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <span>Agent Windtunnel</span>
                <span className="text-gray-700">›</span>
                <span className="text-gray-400">Runs</span>
              </nav>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-50 tracking-tight">Windtunnel Runs</h1>
                {/* Live indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-[10px] font-medium text-green-400 uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium shadow-lg shadow-purple-500/20 transition-colors">
              <span className="text-base leading-none">+</span>
              New Run
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* ── Stats row ── */}
          <div className="grid grid-cols-4 gap-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* Total Runs */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-5 hover:border-white/[0.14] transition-colors">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Total Runs</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-white tabular-nums">{totalRuns}</span>
                    <div className="flex items-center gap-1 text-xs text-green-400 font-medium mb-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                      </svg>
                      <span>All time</span>
                    </div>
                  </div>
                </div>

                {/* Blocked */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-5 hover:border-red-500/20 transition-colors">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Blocked</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-red-400 tabular-nums">{blocked}</span>
                    <span className="text-2xl mb-0.5">🚫</span>
                  </div>
                </div>

                {/* Approved */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-5 hover:border-green-500/20 transition-colors">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Approved</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-green-400 tabular-nums">{approved}</span>
                    <span className="text-2xl mb-0.5">✅</span>
                  </div>
                </div>

                {/* Avg Regression Rate */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-5 hover:border-white/[0.14] transition-colors">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Avg Regression</p>
                  <div className="flex items-end justify-between">
                    <span
                      className="text-3xl font-bold tabular-nums"
                      style={{ color: regressionColor(avgRate) }}
                    >
                      {avgRate}%
                    </span>
                    <CircularProgress value={avgRate} color={regressionColor(avgRate)} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Regression Rate Chart ── */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-200 tracking-tight">Regression Rate Per Run</h2>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Last {chartData.length} runs</span>
            </div>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="h-full w-full animate-pulse bg-white/[0.03] rounded-lg" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#4b5563', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#4b5563', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={regressionColor(entry.rate)} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Runs Table ── */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-200 tracking-tight">All Runs</h2>
              <span className="text-xs text-gray-600">{totalRuns} total</span>
            </div>

            {/* Empty state */}
            {!loading && runs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="text-5xl mb-4">🌪️</div>
                <h3 className="text-base font-semibold text-gray-300 mb-2">No runs yet</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Run your first windtunnel evaluation to start comparing baseline vs challenger prompts.
                </p>
                <div className="code-block text-left text-green-400 text-xs w-full max-w-sm">
                  <span className="text-gray-600">$</span>{' '}
                  <span className="text-purple-400">windtunnel</span>{' '}
                  run --baseline v1 --challenger v2
                </div>
              </div>
            )}

            {/* Table */}
            {(loading || runs.length > 0) && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {[
                        'Verdict',
                        'Run Name',
                        'Baseline → Challenger',
                        'Better',
                        'Worse',
                        'Regression %',
                        'Date',
                        'Action',
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                      : runs.map((run) => {
                          const rate = regressionRate(run)
                          const vc = verdictConfig(run.verdict)
                          return (
                            <tr
                              key={run.id}
                              className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                            >
                              {/* Verdict */}
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${vc.bg} ${vc.text} ${vc.border}`}
                                >
                                  {vc.label}
                                </span>
                              </td>

                              {/* Run Name */}
                              <td className="px-4 py-3 max-w-[180px]">
                                <Link
                                  href={`/run/${run.id}`}
                                  className="text-sm font-medium text-gray-100 hover:text-purple-300 truncate block transition-colors"
                                  title={run.name ?? run.id}
                                >
                                  {run.name ?? run.id.slice(0, 12) + '…'}
                                </Link>
                              </td>

                              {/* Baseline → Challenger */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                                  <span className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-gray-300">
                                    {run.baseline_version}
                                  </span>
                                  <span className="text-gray-600">→</span>
                                  <span className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-gray-300">
                                    {run.challenger_version}
                                  </span>
                                </div>
                              </td>

                              {/* Better */}
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-green-400 tabular-nums">{run.passed}</span>
                              </td>

                              {/* Worse */}
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-red-400 tabular-nums">{run.failed}</span>
                              </td>

                              {/* Regression % */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-semibold tabular-nums w-10 ${regressionTextClass(rate)}`}
                                  >
                                    {rate}%
                                  </span>
                                  {/* Inline mini progress bar */}
                                  <div className="w-[100px] h-1.5 rounded-full bg-white/[0.06] overflow-hidden shrink-0">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${Math.min(rate, 100)}%`,
                                        backgroundColor: regressionColor(rate),
                                        opacity: 0.8,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Date */}
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(run.created_at)}
                                </span>
                              </td>

                              {/* Action */}
                              <td className="px-4 py-3">
                                <Link
                                  href={`/run/${run.id}`}
                                  className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
                                >
                                  View →
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
