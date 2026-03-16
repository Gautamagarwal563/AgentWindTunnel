'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Project } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-white/[0.06] text-white' : 'text-[#666] hover:text-white hover:bg-white/[0.04]'}`}>
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function maskKey(key: string) {
  return `wt_••••••••${key.slice(-4)}`
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() { navigator.clipboard.writeText(project.api_key); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  function handleDelete() { if (confirm(`Delete project "${project.name}"?`)) onDelete(project.id) }

  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#222] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{project.name}</h3>
          {project.description && <p className="text-xs text-[#444] mt-0.5">{project.description}</p>}
          <p className="text-[10px] text-[#333] mt-1">Created {formatDate(project.created_at)}</p>
        </div>
        <button onClick={handleDelete} className="text-[#333] hover:text-[#ef4444] transition-colors text-sm">✕</button>
      </div>
      <div className="flex items-center gap-2 bg-black border border-[#111] rounded-lg px-3 py-2">
        <span className="text-[10px] font-semibold text-[#333] uppercase tracking-widest shrink-0">API KEY</span>
        <span className="flex-1 font-mono text-xs text-[#888] truncate">{revealed ? project.api_key : maskKey(project.api_key)}</span>
        <button onClick={() => setRevealed(r => !r)} className="shrink-0 text-[10px] text-[#444] border border-[#1a1a1a] px-2 py-1 rounded hover:text-white hover:border-[#333] transition-colors">
          {revealed ? 'Hide' : 'Reveal'}
        </button>
        <button onClick={handleCopy} className={`shrink-0 text-[10px] border px-2 py-1 rounded transition-colors ${copied ? 'border-[#22c55e]/30 text-[#22c55e]' : 'border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]'}`}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function NewKeyRevealCard({ project, onDismiss }: { project: Project; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() { navigator.clipboard.writeText(project.api_key); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="border border-[#22c55e]/20 bg-[#22c55e]/[0.03] rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#22c55e] text-sm">✓</span>
            <span className="text-[#22c55e] text-sm font-semibold">Project created — save your API key now</span>
          </div>
          <p className="text-xs text-[#22c55e]/50">This is the only time this key will be shown in full.</p>
        </div>
        <button onClick={onDismiss} className="text-[#333] hover:text-white transition-colors text-sm">✕</button>
      </div>
      <div className="flex items-center gap-2 bg-black border border-[#1a1a1a] rounded-lg px-3 py-2.5">
        <code className="flex-1 font-mono text-sm text-[#22c55e] break-all">{project.api_key}</code>
        <button onClick={handleCopy} className={`shrink-0 text-xs border px-3 py-1.5 rounded transition-colors ${copied ? 'border-[#22c55e]/30 text-[#22c55e]' : 'border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]'}`}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function CreateProjectForm({ onCreated, onCancel }: { onCreated: (p: Project) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required.'); return }
    setLoading(true); setError(null)
    const rawKey = crypto.getRandomValues(new Uint8Array(24))
    const apiKey = 'wt_' + Array.from(rawKey).map(b => b.toString(16).padStart(2, '0')).join('')
    const { data, error: insertError } = await supabase.from('projects').insert({ name: name.trim(), description: description.trim() || null, api_key: apiKey }).select().single()
    setLoading(false)
    if (insertError) { setError(insertError.message); return }
    onCreated(data as Project)
  }

  const inputClass = "bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-[#333] focus-visible:border-[#444] focus-visible:ring-0 h-9"
  const labelClass = "text-[10px] font-semibold text-[#444] uppercase tracking-widest"

  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl mb-6 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111]">
        <span className="text-sm font-medium text-[#888]">New Project</span>
      </div>
      <div className="px-5 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="projectName" className={labelClass}>Project Name *</Label>
            <Input id="projectName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production Agent" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectDesc" className={labelClass}>Description (optional)</Label>
            <Input id="projectDesc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project for?" className={inputClass} />
          </div>
          {error && <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={loading} className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#e5e5e5] transition-colors disabled:opacity-50">
              {loading ? 'Creating…' : 'Create Project'}
            </button>
            <button type="button" onClick={onCancel} className="text-sm text-[#444] border border-[#1a1a1a] px-4 py-2 rounded-lg hover:text-white hover:border-[#333] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IntegrationSnippet() {
  const [copied, setCopied] = useState(false)
  const code = `from windtunnel import WindTunnel\n\nwt = WindTunnel(\n    api_key="your-api-key-here",\n    supabase_url="https://ovaaeoufpwwbnymdcdpi.supabase.co",\n    supabase_key="your-supabase-anon-key"\n)`
  function handleCopy() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between">
        <span className="text-sm font-medium text-[#888]">How to use your API key</span>
        <button onClick={handleCopy} className={`text-[10px] border px-2 py-1 rounded transition-colors ${copied ? 'border-[#22c55e]/30 text-[#22c55e]' : 'border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]'}`}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-5 py-4 text-sm font-mono text-[#666] overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  )
}

export default function ApiKeysPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState<Project | null>(null)

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) setProjects(data as Project[])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  function handleCreated(project: Project) { setProjects(prev => [project, ...prev]); setShowForm(false); setNewProject(project) }
  async function handleDelete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) { setProjects(prev => prev.filter(p => p.id !== id)); if (newProject?.id === id) setNewProject(null) }
  }

  return (
    <div className="bg-black text-white min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-52 border-r border-[#1a1a1a] h-screen fixed left-0 top-0 flex flex-col">
        <div className="px-4 py-5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
            <span className="text-sm font-semibold tracking-tight">Windtunnel</span>
          </div>
        </div>
        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="◈" label="Runs" href="/dashboard" />
          <NavItem icon="◎" label="Interactions" href="/interactions" />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" active />
          <NavItem icon="◻" label="Docs" href="/docs" />
        </nav>
        <div className="px-4 pb-5">
          <span className="text-[10px] text-[#333] font-mono">beta</span>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-52 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-[#1a1a1a] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1.5 text-[10px] text-[#333] mb-1">
                <span>Agent Windtunnel</span><span>›</span><span className="text-[#555]">API Keys</span>
              </nav>
              <h1 className="text-xl font-semibold tracking-tight">API Keys</h1>
            </div>
            <button onClick={() => { setShowForm(true); setNewProject(null) }} className="text-sm font-semibold bg-white text-black px-4 py-2 rounded-lg hover:bg-[#e5e5e5] transition-colors">
              + New Project
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {newProject && <NewKeyRevealCard project={newProject} onDismiss={() => setNewProject(null)} />}
          {showForm && <CreateProjectForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 animate-pulse">
                  <div className="h-4 w-40 rounded bg-[#111] mb-2" />
                  <div className="h-3 w-64 rounded bg-[#0a0a0a]" />
                </div>
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && !showForm && (
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-16 text-center">
              <div className="text-3xl text-[#222] mb-4">⬡</div>
              <h3 className="text-sm font-medium text-[#555] mb-2">No projects yet</h3>
              <p className="text-xs text-[#333] max-w-xs mx-auto mb-6">Create a project to get an API key and start integrating Windtunnel into your agent pipeline.</p>
              <button onClick={() => setShowForm(true)} className="text-sm font-semibold bg-white text-black px-5 py-2 rounded-lg hover:bg-[#e5e5e5] transition-colors">
                Create your first project
              </button>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <div className="space-y-3 mb-8">
              {projects.map(project => <ProjectCard key={project.id} project={project} onDelete={handleDelete} />)}
            </div>
          )}

          {!loading && <IntegrationSnippet />}
        </div>
      </main>
    </div>
  )
}
