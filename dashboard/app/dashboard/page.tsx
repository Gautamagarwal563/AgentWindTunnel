'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase, type Run } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase'

function regressionRate(run: Run): number {
  if (!run.total_interactions || run.total_interactions === 0) return 0
  return Math.round((run.failed / run.total_interactions) * 100)
}

function regressionColor(rate: number): string {
  if (rate > 30) return '#ef4444'
  if (rate >= 10) return '#f59e0b'
  return '#22c55e'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-white/[0.06] text-white' : 'text-[#666] hover:text-white hover:bg-white/[0.04]'}`}>
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; rate: number } }> }) {
  if (!active || !payload?.length) return null
  const { name, rate } = payload[0].payload
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#111] px-3 py-2 shadow-xl text-xs">
      <p className="text-[#888] mb-0.5 truncate max-w-[180px]">{name}</p>
      <p style={{ color: regressionColor(rate) }} className="font-semibold">{rate}% regression</p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchRuns() {
    const { data } = await supabase.from('runs').select('*').order('created_at', { ascending: false }).limit(50)
    if (data) setRuns(data as Run[])
    setLoading(false)
  }

  useEffect(() => {
    fetchRuns()
    const interval = setInterval(fetchRuns, 10_000)
    return () => clearInterval(interval)
  }, [])

  const totalRuns = runs.length
  const blocked = runs.filter((r) => r.verdict?.toLowerCase() === 'blocked').length
  const approved = runs.filter((r) => r.verdict?.toLowerCase() === 'approved').length
  const avgRate = runs.length > 0 ? Math.round(runs.reduce((acc, r) => acc + regressionRate(r), 0) / runs.length) : 0

  const chartData = [...runs].reverse().slice(-20).map((r) => ({
    name: r.name ?? r.id.slice(0, 8),
    rate: regressionRate(r),
  }))

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Sidebar */}
      <aside className="w-52 border-r border-[#1a1a1a] h-screen fixed left-0 top-0 flex flex-col">
        <div className="px-4 py-5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
            <span className="text-sm font-semibold tracking-tight">Windtunnel</span>
          </div>
        </div>
        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="◈" label="Runs" href="/dashboard" active />
          <NavItem icon="◎" label="Interactions" href="/interactions" />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" />
          <NavItem icon="◻" label="Docs" href="/docs" />
        </nav>
        <div className="px-2 pb-4 flex flex-col gap-2">
          <Button variant="ghost" onClick={async () => { await signOut(); router.push('/login') }}
            className="w-full justify-start text-[#444] hover:text-[#ef4444] hover:bg-[#ef4444]/5 text-xs">
            Sign Out
          </Button>
          <div className="px-2">
            <span className="text-[10px] text-[#333] font-mono">beta</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-52 min-h-screen">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-[#111]">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Windtunnel Runs</h1>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
            </span>
          </div>
          <button className="text-sm font-semibold bg-white text-black px-4 py-2 rounded-lg hover:bg-[#e5e5e5] transition-colors">
            + New Run
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-[#1a1a1a] rounded-xl p-4">
                  <Skeleton className="h-3 w-24 bg-[#111] mb-3" />
                  <Skeleton className="h-8 w-16 bg-[#111]" />
                </div>
              ))
            ) : (
              <>
                {[
                  { label: 'Total Runs', value: totalRuns, color: 'text-white' },
                  { label: 'Blocked', value: blocked, color: 'text-[#ef4444]' },
                  { label: 'Approved', value: approved, color: 'text-[#22c55e]' },
                  { label: 'Avg Regression', value: `${avgRate}%`, color: avgRate > 30 ? 'text-[#ef4444]' : avgRate >= 10 ? 'text-[#f59e0b]' : 'text-[#22c55e]' },
                ].map((s) => (
                  <div key={s.label} className="border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">{s.label}</div>
                    <span className={`text-3xl font-semibold tabular-nums ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Chart */}
          <div className="border border-[#1a1a1a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#888]">Regression Rate Per Run</span>
              <span className="text-[10px] text-[#333] uppercase tracking-widest">Last {chartData.length} runs</span>
            </div>
            {loading ? (
              <Skeleton className="h-[180px] w-full bg-[#111]" />
            ) : chartData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-[#333] text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#333', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#333', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={regressionColor(entry.rate)} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table */}
          <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between">
              <span className="text-sm font-medium text-[#888]">All Runs</span>
              <span className="text-xs text-[#333]">{totalRuns} total</span>
            </div>

            {!loading && runs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4 text-[#222]">◈</div>
                <h3 className="text-sm font-medium text-[#555] mb-2">No runs yet</h3>
                <p className="text-xs text-[#333] max-w-xs mb-6">Run your first evaluation to compare baseline vs challenger prompts.</p>
                <pre className="bg-[#080808] border border-[#1a1a1a] rounded-lg px-4 py-3 text-xs font-mono text-[#555]">windtunnel check --baseline v1 --challenger v2</pre>
              </div>
            )}

            {(loading || runs.length > 0) && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#111]">
                    {['Verdict', 'Run Name', 'Versions', 'Better', 'Worse', 'Regression', 'Date', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] text-[#333] uppercase tracking-widest font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-[#0a0a0a]">
                          {[100, 160, 120, 50, 50, 140, 110, 30].map((w, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-3 bg-[#111]" style={{ width: w }} /></td>
                          ))}
                        </tr>
                      ))
                    : runs.map((run) => {
                        const rate = regressionRate(run)
                        const verdict = run.verdict?.toLowerCase()
                        return (
                          <tr key={run.id} className="border-b border-[#0a0a0a] hover:bg-[#080808] transition-colors group">
                            <td className="px-4 py-3">
                              {verdict === 'blocked' ? (
                                <span className="text-[11px] font-semibold bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-2 py-0.5 rounded-full">BLOCKED</span>
                              ) : verdict === 'approved' ? (
                                <span className="text-[11px] font-semibold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 px-2 py-0.5 rounded-full">APPROVED</span>
                              ) : (
                                <span className="text-[11px] font-semibold bg-[#111] text-[#555] border border-[#1a1a1a] px-2 py-0.5 rounded-full">{run.verdict ?? 'Unknown'}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 max-w-[180px]">
                              <Link href={`/run/${run.id}`} className="text-sm text-white hover:text-[#aaa] truncate block transition-colors" title={run.name ?? run.id}>
                                {run.name ?? run.id.slice(0, 12) + '…'}
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-[#444]">{run.baseline_version} <span className="text-[#222]">→</span> {run.challenger_version}</span>
                            </td>
                            <td className="px-4 py-3"><span className="text-sm font-semibold text-[#22c55e] tabular-nums">{run.passed}</span></td>
                            <td className="px-4 py-3"><span className="text-sm font-semibold text-[#ef4444] tabular-nums">{run.failed}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold tabular-nums w-10" style={{ color: regressionColor(rate) }}>{rate}%</span>
                                <div className="w-16 h-1 bg-[#111] rounded overflow-hidden">
                                  <div className="h-full rounded transition-all duration-500" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: regressionColor(rate), opacity: 0.8 }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className="text-xs text-[#333]">{formatDate(run.created_at)}</span></td>
                            <td className="px-4 py-3">
                              <Link href={`/run/${run.id}`} className="text-[#333] group-hover:text-white transition-colors text-sm">→</Link>
                            </td>
                          </tr>
                        )
                      })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
