'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-white/[0.06] text-white' : 'text-[#666] hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function truncate(str: string, len: number) {
  return str && str.length > len ? str.slice(0, len) + '…' : str
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [versionFilter, setVersionFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function fetchInteractions() {
    const { data } = await supabase
      .from('interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setInteractions(data as Interaction[])
    setLoading(false)
  }

  useEffect(() => {
    fetchInteractions()
    const interval = setInterval(fetchInteractions, 10_000)
    return () => clearInterval(interval)
  }, [])

  const versions = ['all', ...Array.from(new Set(interactions.map((i) => i.prompt_version).filter(Boolean)))]

  const filtered = interactions.filter((i) => {
    const matchSearch = !search || i.user_input?.toLowerCase().includes(search.toLowerCase()) || i.agent_output?.toLowerCase().includes(search.toLowerCase())
    const matchVersion = versionFilter === 'all' || i.prompt_version === versionFilter
    return matchSearch && matchVersion
  })

  const uniqueSessions = new Set(interactions.map((i) => i.session_id)).size
  const uniqueModels = new Set(interactions.map((i) => i.model).filter(Boolean)).size

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Sidebar */}
      <aside className="w-52 border-r border-[#1a1a1a] h-screen fixed left-0 top-0 flex flex-col">
        <div className="px-4 py-5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">
              WT
            </div>
            <span className="text-sm font-semibold tracking-tight">Windtunnel</span>
          </div>
        </div>
        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="◈" label="Runs" href="/dashboard" />
          <NavItem icon="◎" label="Interactions" href="/interactions" active />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" />
          <NavItem icon="◻" label="Docs" href="/docs" />
        </nav>
        <div className="px-4 pb-5">
          <span className="text-[10px] text-[#333] font-mono">beta</span>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-52 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Interactions</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-sm text-[#555]">{interactions.length} total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Recorded', value: interactions.length },
            { label: 'Unique Sessions', value: uniqueSessions },
            { label: 'Models Used', value: uniqueModels },
          ].map((s) => (
            <div key={s.label} className="border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-[11px] text-[#555] uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-2xl font-semibold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search interactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333]"
          />
          <select
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-[#888] focus:outline-none focus:border-[#333]"
          >
            {versions.map((v) => (
              <option key={v} value={v}>{v === 'all' ? 'All versions' : v}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#444] text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-[#333] text-3xl mb-3">◎</div>
              <div className="text-[#555] text-sm">No interactions recorded yet.</div>
              <div className="text-[#333] text-xs mt-1">Install the SDK to start recording.</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {['Session', 'User Input', 'Agent Output', 'Version', 'Model', 'Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] text-[#444] uppercase tracking-widest font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((interaction) => (
                  <>
                    <tr
                      key={interaction.id}
                      onClick={() => setExpandedId(expandedId === interaction.id ? null : interaction.id)}
                      className="border-b border-[#0f0f0f] hover:bg-[#0a0a0a] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#444]">{interaction.session_id?.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-[#aaa] max-w-[200px]">{truncate(interaction.user_input, 60)}</td>
                      <td className="px-4 py-3 text-[#555] max-w-[200px]">{truncate(interaction.agent_output, 60)}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-[#111] border border-[#1a1a1a] px-2 py-0.5 rounded text-[#888]">
                          {interaction.prompt_version || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#555]">{interaction.model || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[#444]">{formatDate(interaction.created_at)}</td>
                      <td className="px-4 py-3 text-[#333] text-xs">{expandedId === interaction.id ? '▲' : '▼'}</td>
                    </tr>
                    {expandedId === interaction.id && (
                      <tr key={`${interaction.id}-expanded`} className="border-b border-[#1a1a1a] bg-[#080808]">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">User Input</div>
                              <div className="text-sm text-[#aaa] bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 font-mono whitespace-pre-wrap leading-relaxed">
                                {interaction.user_input}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">Agent Output</div>
                              <div className="text-sm text-[#aaa] bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 font-mono whitespace-pre-wrap leading-relaxed">
                                {interaction.agent_output}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
