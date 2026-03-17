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
import { motion } from 'framer-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

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
    <Link href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group"
      style={{
        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: active ? '#fff' : '#555',
        borderLeft: active ? '2px solid #0A5CF5' : '2px solid transparent',
      }}
    >
      <span className="text-sm">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; rate: number } }> }) {
  if (!active || !payload?.length) return null
  const { name, rate } = payload[0].payload
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-2xl" style={{ border: '1px solid #1a1a1a', background: '#111' }}>
      <p className="truncate max-w-[180px] mb-0.5" style={{ color: '#888' }}>{name}</p>
      <p className="font-semibold" style={{ color: regressionColor(rate) }}>{rate}% regression</p>
    </div>
  )
}

function StatCard({ label, value, color, delay }: { label: string; value: string | number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      className="rounded-xl p-5"
      style={{ border: '1px solid #1a1a1a', background: '#0A0A0A' }}
      whileHover={{ borderColor: '#2a2a2a' } as Parameters<typeof motion.div>[0]['whileHover']}
    >
      <div className="text-[10px] uppercase tracking-widest font-semibold mb-2.5" style={{ color: '#444' }}>{label}</div>
      <motion.span
        key={String(value)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-semibold tabular-nums"
        style={{ color, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </motion.span>
    </motion.div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchRuns() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id)
    const projectIds = (projects || []).map(p => p.id)
    if (projectIds.length === 0) { setRuns([]); setLoading(false); return }
    const { data } = await supabase.from('runs').select('*').in('project_id', projectIds).order('created_at', { ascending: false }).limit(50)
    if (data) setRuns(data as Run[])
    setLoading(false)
  }

  useEffect(() => {
    fetchRuns()
    const interval = setInterval(fetchRuns, 10_000)
    return () => clearInterval(interval)
  }, [])

  const totalRuns = runs.length
  const blocked = runs.filter(r => r.verdict?.toLowerCase() === 'blocked').length
  const approved = runs.filter(r => r.verdict?.toLowerCase() === 'approved').length
  const avgRate = runs.length > 0 ? Math.round(runs.reduce((acc, r) => acc + regressionRate(r), 0) / runs.length) : 0

  const chartData = [...runs].reverse().slice(-20).map(r => ({
    name: r.name ?? r.id.slice(0, 8),
    rate: regressionRate(r),
  }))

  return (
    <div className="bg-black text-white min-h-screen">

      {/* ─── Sidebar ───────────────────────────────────────────────── */}
      <aside style={{ width: 220, borderRight: '1px solid #111', background: '#080808' }}
        className="h-screen fixed left-0 top-0 flex flex-col z-30">
        <div className="px-5 py-6 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold tracking-tight">WT</div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Windtunnel</div>
              <div className="text-[9px] font-mono" style={{ color: '#333' }}>beta</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="◈" label="Runs" href="/dashboard" active />
          <NavItem icon="◎" label="Interactions" href="/interactions" />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" />
          <NavItem icon="◻" label="Docs" href="/docs" />
        </nav>

        <div className="px-2 pb-5">
          <button
            onClick={async () => { await signOut(); router.push('/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{ color: '#444' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'transparent' }}
          >
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main ──────────────────────────────────────────────────── */}
      <main style={{ marginLeft: 220 }} className="min-h-screen">

        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: '1px solid #111' }}>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Windtunnel Runs</h1>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22c55e' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22c55e' }} />
            </span>
          </div>
          <button
            onClick={() => window.open('/docs?section=quickstart', '_blank')}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{ background: '#fff', color: '#000' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            title="Use the SDK to create runs. See docs →"
          >+ New Run</button>
        </div>

        <div className="px-8 py-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl p-4" style={{ border: '1px solid #111' }}>
                  <Skeleton className="h-3 w-24 mb-3" style={{ background: '#111' }} />
                  <Skeleton className="h-8 w-16" style={{ background: '#111' }} />
                </div>
              ))
              : <>
                <StatCard label="Total Runs" value={totalRuns} color="#fff" delay={0} />
                <StatCard label="Blocked" value={blocked} color="#ef4444" delay={0.07} />
                <StatCard label="Approved" value={approved} color="#22c55e" delay={0.14} />
                <StatCard label="Avg Regression" value={`${avgRate}%`} color={avgRate > 30 ? '#ef4444' : avgRate >= 10 ? '#f59e0b' : '#22c55e'} delay={0.21} />
              </>
            }
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-xl p-5"
            style={{ border: '1px solid #111', background: '#080808' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: '#888' }}>Regression Rate Per Run</span>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: '#333' }}>Last {chartData.length} runs</span>
            </div>
            {loading
              ? <Skeleton className="h-[180px] w-full" style={{ background: '#111' }} />
              : chartData.length === 0
              ? <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: '#333' }}>No data yet</div>
              : <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#333', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#333', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={regressionColor(entry.rate)} opacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            }
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #111' }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #0d0d0d' }}>
              <span className="text-sm font-medium" style={{ color: '#888' }}>All Runs</span>
              <span className="text-xs" style={{ color: '#333' }}>{totalRuns} total</span>
            </div>

            {!loading && runs.length === 0 && (
              <div className="px-8 py-12">
                <div className="text-center mb-10">
                  <div className="text-3xl mb-3" style={{ color: '#1a1a1a' }}>◈</div>
                  <h3 className="text-sm font-medium mb-1.5" style={{ color: '#555' }}>No runs yet</h3>
                  <p className="text-xs" style={{ color: '#333' }}>Follow the steps below to get started.</p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="rounded-xl p-5" style={{ background: '#080808', border: '1px solid #1a1a1a' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#0A5CF5' }}>Step 1</div>
                    <h4 className="text-sm font-medium mb-1.5 text-white">Create a project</h4>
                    <p className="text-xs mb-4" style={{ color: '#444' }}>Get an API key to authenticate your requests.</p>
                    <Link href="/api-keys"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(10,92,245,0.12)', color: '#0A5CF5', border: '1px solid rgba(10,92,245,0.2)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,92,245,0.2)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,92,245,0.12)' }}
                    >Go to API Keys →</Link>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: '#080808', border: '1px solid #1a1a1a' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>Step 2</div>
                    <h4 className="text-sm font-medium mb-1.5 text-white">Record interactions</h4>
                    <p className="text-xs mb-4" style={{ color: '#444' }}>Send your agent's inputs and outputs to Windtunnel.</p>
                    <pre className="rounded-lg px-3 py-2.5 text-[10px] font-mono leading-relaxed overflow-x-auto" style={{ background: '#000', border: '1px solid #111', color: '#666' }}>{`requests.post(
  "https://windtunnel-six.vercel.app/api/interactions",
  headers={"Authorization":
    "Bearer YOUR_API_KEY"},
  json={
    "session_id": "user-123",
    "user_input": "...",
    "agent_output": "...",
    "prompt_version": "v1"
  })`}</pre>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: '#080808', border: '1px solid #1a1a1a' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>Step 3</div>
                    <h4 className="text-sm font-medium mb-1.5 text-white">Run a regression check</h4>
                    <p className="text-xs mb-4" style={{ color: '#444' }}>Compare baseline vs challenger and get a verdict.</p>
                    <pre className="rounded-lg px-3 py-2.5 text-[10px] font-mono leading-relaxed overflow-x-auto" style={{ background: '#000', border: '1px solid #111', color: '#666' }}>{`result = requests.post(
  "https://windtunnel-six.vercel.app/api/runs",
  headers={"Authorization":
    "Bearer YOUR_API_KEY"},
  json={
    "baseline_version": "v1",
    "challenger_version": "v2",
    "threshold": 0.3,
    ...
  }).json()

print(result["verdict"])
# "APPROVED" or "BLOCKED"`}</pre>
                  </div>
                </div>
              </div>
            )}

            {(loading || runs.length > 0) && (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #0d0d0d' }}>
                    {['Verdict', 'Run Name', 'Versions', 'Better', 'Worse', 'Regression', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium" style={{ fontSize: 10, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #080808' }}>
                        {[100, 160, 120, 50, 50, 140, 110, 30].map((w, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-3" style={{ width: w, background: '#111' }} /></td>
                        ))}
                      </tr>
                    ))
                    : runs.map(run => {
                      const rate = regressionRate(run)
                      const verdict = run.verdict?.toLowerCase()
                      return (
                        <tr key={run.id} className="group transition-colors" style={{ borderBottom: '1px solid #080808' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#0A0A0A' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <td className="px-4 py-3">
                            {verdict === 'blocked'
                              ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>BLOCKED</span>
                              : verdict === 'approved'
                              ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>APPROVED</span>
                              : <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#111', color: '#555', border: '1px solid #1a1a1a' }}>{run.verdict ?? 'Unknown'}</span>
                            }
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <Link href={`/run/${run.id}`} className="text-sm truncate block transition-colors" style={{ color: '#fff' }}
                              title={run.name ?? run.id}
                              onMouseEnter={e => { e.currentTarget.style.color = '#888' }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#fff' }}
                            >{run.name ?? run.id.slice(0, 12) + '…'}</Link>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs" style={{ color: '#444' }}>{run.baseline_version} <span style={{ color: '#222' }}>→</span> {run.challenger_version}</span>
                          </td>
                          <td className="px-4 py-3"><span className="text-sm font-semibold tabular-nums" style={{ color: '#22c55e' }}>{run.passed}</span></td>
                          <td className="px-4 py-3"><span className="text-sm font-semibold tabular-nums" style={{ color: '#ef4444' }}>{run.failed}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold tabular-nums w-10" style={{ color: regressionColor(rate) }}>{rate}%</span>
                              <div className="w-16 h-1.5 rounded overflow-hidden" style={{ background: '#111' }}>
                                <div className="h-full rounded transition-all duration-500" style={{ width: `${Math.min(rate, 100)}%`, background: regressionColor(rate), opacity: 0.85 }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs" style={{ color: '#333' }}>{formatDate(run.created_at)}</span></td>
                          <td className="px-4 py-3">
                            <Link href={`/run/${run.id}`} className="transition-colors text-sm" style={{ color: '#333' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#333' }}
                            >→</Link>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
