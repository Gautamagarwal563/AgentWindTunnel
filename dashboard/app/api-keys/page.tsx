'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Project } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function maskKey(key: string) { return `wt_••••••••${key.slice(-4)}` }

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  function handleCopy() { navigator.clipboard.writeText(project.api_key); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  function handleDelete() { if (confirm(`Delete project "${project.name}"?`)) onDelete(project.id) }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
      className="rounded-2xl p-5 transition-all duration-200"
      style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}
      whileHover={{ borderColor: '#2a2a2a' } as Parameters<typeof motion.div>[0]['whileHover']}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{project.name}</h3>
          {project.description && <p className="text-xs mt-0.5" style={{ color: '#444' }}>{project.description}</p>}
          <p className="text-[10px] mt-1" style={{ color: '#333' }}>Created {formatDate(project.created_at)}</p>
        </div>
        <button onClick={handleDelete} className="text-sm transition-colors" style={{ color: '#333' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#333' }}>✕</button>
      </div>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: '#000', border: '1px solid #111' }}>
        <span className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: '#333' }}>API KEY</span>
        <span className="flex-1 font-mono text-xs truncate" style={{ color: '#888' }}>{revealed ? project.api_key : maskKey(project.api_key)}</span>
        <button onClick={() => setRevealed(r => !r)}
          className="shrink-0 text-[10px] px-2 py-1 rounded transition-all"
          style={{ border: '1px solid #1a1a1a', color: '#444' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = '#1a1a1a' }}
        >{revealed ? 'Hide' : 'Reveal'}</button>
        <button onClick={handleCopy}
          className="shrink-0 text-[10px] px-2 py-1 rounded transition-all"
          style={{ border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid #1a1a1a', color: copied ? '#22c55e' : '#444' }}
          onMouseEnter={e => { if (!copied) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' } }}
          onMouseLeave={e => { if (!copied) { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = '#1a1a1a' } }}
        >{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </motion.div>
  )
}

function NewKeyRevealCard({ project, onDismiss }: { project: Project; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() { navigator.clipboard.writeText(project.api_key); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
      className="rounded-2xl p-5 mb-6" style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.03)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm" style={{ color: '#22c55e' }}>✓</span>
            <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>Project created — save your API key now</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(34,197,94,0.5)' }}>This is the only time this key will be shown in full.</p>
        </div>
        <button onClick={onDismiss} className="text-sm transition-colors" style={{ color: '#333' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.color = '#333' }}>✕</button>
      </div>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: '#000', border: '1px solid #1a1a1a' }}>
        <code className="flex-1 font-mono text-sm break-all" style={{ color: '#22c55e' }}>{project.api_key}</code>
        <button onClick={handleCopy}
          className="shrink-0 text-xs px-3 py-1.5 rounded transition-all"
          style={{ border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid #1a1a1a', color: copied ? '#22c55e' : '#444' }}
        >{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </motion.div>
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
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: insertError } = await supabase.from('projects').insert({ name: name.trim(), description: description.trim() || null, api_key: apiKey, user_id: user?.id }).select().single()
    setLoading(false)
    if (insertError) { setError(insertError.message); return }
    onCreated(data as Project)
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}
      className="rounded-2xl mb-6 overflow-hidden" style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #111' }}>
        <span className="text-sm font-medium" style={{ color: '#888' }}>New Project</span>
      </div>
      <div className="px-5 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Project Name *', value: name, setter: setName, placeholder: 'e.g. Production Agent' },
            { id: 'desc', label: 'Description (optional)', value: description, setter: setDescription, placeholder: 'What is this project for?' },
          ].map(f => (
            <div key={f.id} className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#444' }}>{f.label}</label>
              <input id={f.id} type="text" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                className="w-full h-9 px-3 rounded-lg text-sm text-white placeholder:text-[#333] outline-none transition-all"
                style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#333' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
              />
            </div>
          ))}
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              style={{ background: '#fff', color: '#000' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e5e5e5' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >{loading ? 'Creating…' : 'Create Project'}</button>
            <button type="button" onClick={onCancel}
              className="text-sm px-4 py-2 rounded-lg transition-all"
              style={{ color: '#444', border: '1px solid #1a1a1a' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = '#1a1a1a' }}
            >Cancel</button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

function IntegrationSnippet() {
  const [copied, setCopied] = useState(false)
  const code = `import requests

# Record an interaction
requests.post("https://windtunnel-six.vercel.app/api/interactions",
  headers={"Authorization": "Bearer YOUR_API_KEY"},
  json={
    "session_id": "user-123",
    "user_input": "How do I reset my password?",
    "agent_output": "Click 'Forgot password' on the login page.",
    "prompt_version": "v1",
    "model": "gpt-4o"
  })

# Run a regression check
result = requests.post("https://windtunnel-six.vercel.app/api/runs",
  headers={"Authorization": "Bearer YOUR_API_KEY"},
  json={
    "name": "Prompt v1 vs v2",
    "baseline_version": "v1",
    "challenger_version": "v2",
    "baseline_prompt": "You are a helpful support agent...",
    "challenger_prompt": "You are a helpful support agent v2...",
    "threshold": 0.3,
    "interactions": [
      {
        "user_input": "How do I reset my password?",
        "baseline_output": "Click Forgot password on the login page.",
        "challenger_output": "To reset your password, visit the login page."
      }
    ]
  }).json()

print(result["verdict"])  # "APPROVED" or "BLOCKED"`
  function handleCopy() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #111' }}>
        <span className="text-sm font-medium" style={{ color: '#888' }}>How to use your API key</span>
        <button onClick={handleCopy}
          className="text-[10px] px-2 py-1 rounded transition-all"
          style={{ border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid #1a1a1a', color: copied ? '#22c55e' : '#444' }}
        >{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <pre className="px-5 py-4 text-sm font-mono leading-relaxed overflow-x-auto" style={{ color: '#666' }}>{code}</pre>
    </div>
  )
}

export default function ApiKeysPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState<Project | null>(null)

  async function fetchProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
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
          <NavItem icon="◎" label="Interactions" href="/interactions" />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" active />
          <NavItem icon="◻" label="Docs" href="/docs" />
        </nav>
        <div className="px-4 pb-5">
          <span className="text-[9px] font-mono" style={{ color: '#333' }}>beta</span>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220 }} className="overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(8,8,8,0.92)', borderBottom: '1px solid #1a1a1a', backdropFilter: 'blur(16px)' }}>
          <div>
            <nav className="flex items-center gap-1.5 mb-1" style={{ fontSize: 10, color: '#333' }}>
              <span>Agent Windtunnel</span><span>›</span><span style={{ color: '#555' }}>API Keys</span>
            </nav>
            <h1 className="text-xl font-semibold tracking-tight">API Keys</h1>
          </div>
          <button onClick={() => { setShowForm(true); setNewProject(null) }}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{ background: '#fff', color: '#000' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >+ New Project</button>
        </div>

        <div className="px-8 py-6">
          <AnimatePresence>
            {newProject && <NewKeyRevealCard project={newProject} onDismiss={() => setNewProject(null)} />}
          </AnimatePresence>
          <AnimatePresence>
            {showForm && <CreateProjectForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}
          </AnimatePresence>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}>
                  <div className="h-4 w-40 rounded mb-2" style={{ background: '#111' }} />
                  <div className="h-3 w-64 rounded" style={{ background: '#0d0d0d' }} />
                </div>
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && !showForm && (
            <div className="rounded-2xl p-16 text-center" style={{ background: '#0A0A0A', border: '1px solid #1a1a1a' }}>
              <div className="text-3xl mb-4" style={{ color: '#222' }}>⬡</div>
              <h3 className="text-sm font-medium mb-2" style={{ color: '#555' }}>No projects yet</h3>
              <p className="text-xs max-w-xs mx-auto mb-6" style={{ color: '#333' }}>Create a project to get an API key and start integrating Windtunnel into your agent pipeline.</p>
              <button onClick={() => setShowForm(true)}
                className="text-sm font-semibold px-5 py-2 rounded-lg transition-all"
                style={{ background: '#fff', color: '#000' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >Create your first project</button>
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
