'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

type Interaction = {
  id: string
  project_id: string
  session_id: string
  user_input: string
  agent_output: string
  prompt_version: string
  model: string
  metadata: Record<string, unknown>
  created_at: string
}

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
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

function truncate(str: string, len: number) {
  return str && str.length > len ? str.slice(0, len) + '…' : str
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [versionFilter, setVersionFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function fetchInteractions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id)
    const projectIds = (projects || []).map(p => p.id)
    if (projectIds.length === 0) { setInteractions([]); setLoading(false); return }
    const { data } = await supabase.from('interactions').select('*').in('project_id', projectIds).order('created_at', { ascending: false }).limit(100)
    if (data) setInteractions(data as Interaction[])
    setLoading(false)
  }

  useEffect(() => {
    fetchInteractions()
    const interval = setInterval(fetchInteractions, 10_000)
    return () => clearInterval(interval)
  }, [])

  const versions = ['all', ...Array.from(new Set(interactions.map(i => i.prompt_version).filter(Boolean)))]
  const filtered = interactions.filter(i => {
    const matchSearch = !search || i.user_input?.toLowerCase().includes(search.toLowerCase()) || i.agent_output?.toLowerCase().includes(search.toLowerCase())
    const matchVersion = versionFilter === 'all' || i.prompt_version === versionFilter
    return matchSearch && matchVersion
  })
  const uniqueSessions = new Set(interactions.map(i => i.session_id)).size
  const uniqueModels = new Set(interactions.map(i => i.model).filter(Boolean)).size

  return (
    <div className="min-h-screen" style={{ background: '#080808', color: '#fff' }}>

      {/* Sidebar */}
      <aside style={{ width: 220, borderRight: '1px solid #111', background: '#080808' }}
        className="h-screen fixed left-0 top-0 flex flex-col z-30">
        <div className="px-5 py-6 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Windtunnel</div>
              <div className="text-[9px] font-mono" style={{ color: '#333' }}>beta</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="◈" label="Runs" href="/dashboard" />
          <NavItem icon="◎" label="Interactions" href="/interactions" active />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" />
          <NavItem icon="◻" label="Docs" href="/docs" />
        </nav>
        <div className="px-4 pb-5">
          <span className="text-[9px] font-mono" style={{ color: '#333' }}>beta</span>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220 }} className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Interactions</h1>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22c55e' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22c55e' }} />
            </span>
            <span className="text-sm" style={{ color: '#555' }}>{interactions.length} total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Recorded', value: interactions.length },
            { label: 'Unique Sessions', value: uniqueSessions },
            { label: 'Models Used', value: uniqueModels },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5, ease }}
              className="rounded-xl p-4" style={{ border: '1px solid #1a1a1a', background: '#0A0A0A' }}>
              <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#444' }}>{s.label}</div>
              <div className="text-2xl font-semibold">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <input
            type="text" placeholder="Search interactions..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 max-w-xs h-9 px-3 rounded-lg text-sm text-white placeholder:text-[#444] outline-none transition-all"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#333' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
          />
          <select value={versionFilter} onChange={e => setVersionFilter(e.target.value)}
            className="h-9 px-3 rounded-lg text-sm outline-none transition-all"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#888' }}>
            {versions.map(v => <option key={v} value={v}>{v === 'all' ? 'All versions' : v}</option>)}
          </select>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: '#444' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <div className="text-3xl mb-3" style={{ color: '#222' }}>◎</div>
              <div className="text-sm mb-1" style={{ color: '#555' }}>No interactions recorded yet.</div>
              <div className="text-xs" style={{ color: '#333' }}>Install the SDK to start recording.</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #111' }}>
                  {['Session', 'User Input', 'Agent Output', 'Version', 'Model', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ fontSize: 10, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((interaction, index) => (
                  <>
                    <motion.tr key={interaction.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03, duration: 0.3 }}
                      onClick={() => setExpandedId(expandedId === interaction.id ? null : interaction.id)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid #0d0d0d' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#0A0A0A' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#444' }}>{interaction.session_id?.slice(0, 8)}…</td>
                      <td className="px-4 py-3 max-w-[200px]" style={{ color: '#aaa' }}>{truncate(interaction.user_input, 60)}</td>
                      <td className="px-4 py-3 max-w-[200px]" style={{ color: '#555' }}>{truncate(interaction.agent_output, 60)}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: '#111', border: '1px solid #1a1a1a', color: '#888' }}>
                          {interaction.prompt_version || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#555' }}>{interaction.model || '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#444' }}>{formatDate(interaction.created_at)}</td>
                      <td className="px-4 py-3 text-xs transition-transform duration-200" style={{ color: '#333', transform: expandedId === interaction.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</td>
                    </motion.tr>
                    <AnimatePresence>
                      {expandedId === interaction.id && (
                        <motion.tr key={`${interaction.id}-exp`}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ borderBottom: '1px solid #1a1a1a', background: '#050505' }}>
                          <td colSpan={7} className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {[{ label: 'User Input', text: interaction.user_input }, { label: 'Agent Output', text: interaction.agent_output }].map(col => (
                                <div key={col.label}>
                                  <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#444' }}>{col.label}</div>
                                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed rounded-lg p-3" style={{ color: '#888', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                                    {col.text}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </main>
    </div>
  )
}
