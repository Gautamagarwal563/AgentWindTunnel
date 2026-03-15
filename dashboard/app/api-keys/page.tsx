'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Project } from '@/lib/supabase'

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function maskKey(key: string): string {
  const last4 = key.slice(-4)
  return `wt_••••••••••••${last4}`
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project
  onDelete: (id: string) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(project.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDelete() {
    if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      onDelete(project.id)
    }
  }

  return (
    <div className="bg-[#0D1117] border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.14] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-white text-base leading-tight truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
          )}
          <p className="text-gray-600 text-xs mt-2">Created {formatDate(project.created_at)}</p>
        </div>
        <button
          onClick={handleDelete}
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Delete project"
        >
          <span className="text-sm leading-none">✕</span>
        </button>
      </div>

      {/* API Key row */}
      <div className="mt-3 flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest shrink-0 w-14">
          API Key
        </span>
        <span className="flex-1 font-mono text-xs text-gray-300 truncate">
          {revealed ? project.api_key : maskKey(project.api_key)}
        </span>
        <button
          onClick={() => setRevealed((r) => !r)}
          className="shrink-0 text-[11px] font-medium text-gray-500 hover:text-gray-200 transition-colors px-2 py-0.5 rounded border border-white/[0.08] hover:border-white/[0.16]"
        >
          {revealed ? 'Hide' : 'Reveal'}
        </button>
        <button
          onClick={handleCopy}
          className={`shrink-0 text-[11px] font-medium transition-colors px-2 py-0.5 rounded border ${
            copied
              ? 'text-green-400 border-green-500/30 bg-green-500/10'
              : 'text-gray-500 border-white/[0.08] hover:text-gray-200 hover:border-white/[0.16]'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

// ─── New API Key Reveal Card ──────────────────────────────────────────────────

function NewKeyRevealCard({
  project,
  onDismiss,
}: {
  project: Project
  onDismiss: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(project.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-green-500/30 bg-green-500/[0.05] p-5 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-base">✓</span>
            <h3 className="text-sm font-semibold text-green-300">Project created — save your API key now</h3>
          </div>
          <p className="text-xs text-green-400/70">
            This is the only time this key will be shown in full. Copy it before leaving this page.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-600 hover:text-gray-400 transition-colors text-sm ml-3 shrink-0"
        >
          ✕
        </button>
      </div>
      <div className="flex items-center gap-2 bg-[#0D1117] border border-white/[0.10] rounded-lg px-3 py-2.5">
        <code className="flex-1 font-mono text-sm text-green-300 break-all">{project.api_key}</code>
        <button
          onClick={handleCopy}
          className={`shrink-0 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg border ${
            copied
              ? 'text-green-400 border-green-500/40 bg-green-500/10'
              : 'text-gray-300 border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08]'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

// ─── Create Project Form ──────────────────────────────────────────────────────

function CreateProjectForm({
  onCreated,
  onCancel,
}: {
  onCreated: (project: Project) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required.')
      return
    }
    setLoading(true)
    setError(null)

    // Generate a random API key
    const rawKey = crypto.getRandomValues(new Uint8Array(24))
    const apiKey = 'wt_' + Array.from(rawKey).map((b) => b.toString(16).padStart(2, '0')).join('')

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({ name: name.trim(), description: description.trim() || null, api_key: apiKey })
      .select()
      .single()

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    onCreated(data as Project)
  }

  return (
    <div className="bg-[#0D1117] border border-white/[0.08] rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production Agent"
            className="w-full bg-[#080B14] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Description <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project for?"
            className="w-full bg-[#080B14] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating…' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 text-sm font-medium hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Integration Snippet ──────────────────────────────────────────────────────

function IntegrationSnippet() {
  const [copied, setCopied] = useState(false)

  const code = `from windtunnel import WindTunnel

wt = WindTunnel(
    api_key="your-api-key-here",
    supabase_url="https://ovaaeoufpwwbnymdcdpi.supabase.co",
    supabase_key="your-supabase-anon-key"
)`

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#0D1117] border border-white/[0.08] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-gray-200 tracking-tight">How to use your API key</h2>
        <button
          onClick={handleCopy}
          className={`text-xs font-medium transition-colors px-3 py-1.5 rounded-lg border ${
            copied
              ? 'text-green-400 border-green-500/30 bg-green-500/10'
              : 'text-gray-500 border-white/[0.08] hover:text-gray-200 hover:border-white/[0.16]'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="px-5 py-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed font-mono">
          <span className="text-purple-400">from</span>
          <span className="text-gray-300"> windtunnel </span>
          <span className="text-purple-400">import</span>
          <span className="text-gray-300"> WindTunnel{'\n\n'}</span>
          <span className="text-gray-400">wt = </span>
          <span className="text-blue-300">WindTunnel</span>
          <span className="text-gray-300">({'\n'}</span>
          <span className="text-gray-400">{'    '}</span>
          <span className="text-green-300">api_key</span>
          <span className="text-gray-400">=</span>
          <span className="text-amber-300">"your-api-key-here"</span>
          <span className="text-gray-300">,{'\n'}</span>
          <span className="text-gray-400">{'    '}</span>
          <span className="text-green-300">supabase_url</span>
          <span className="text-gray-400">=</span>
          <span className="text-amber-300">"https://ovaaeoufpwwbnymdcdpi.supabase.co"</span>
          <span className="text-gray-300">,{'\n'}</span>
          <span className="text-gray-400">{'    '}</span>
          <span className="text-green-300">supabase_key</span>
          <span className="text-gray-400">=</span>
          <span className="text-amber-300">"your-supabase-anon-key"</span>
          <span className="text-gray-300">{'\n'})</span>
        </pre>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="text-5xl mb-4">🔑</div>
      <h3 className="text-base font-semibold text-gray-300 mb-2">No projects yet</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Create a project to get an API key and start integrating Windtunnel into your agent pipeline.
      </p>
      <button
        onClick={onNew}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium shadow-lg shadow-purple-500/20 transition-all"
      >
        Create your first project
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApiKeysPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState<Project | null>(null)

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setProjects(data as Project[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev])
    setShowForm(false)
    setNewProject(project)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (newProject?.id === id) setNewProject(null)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080B14] text-gray-100">
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
          <NavItem icon="🌪️" label="Runs" href="/dashboard" />
          <NavItem icon="📡" label="Interactions" href="/interactions" />
          <NavItem icon="🔑" label="API Keys" href="/api-keys" active />
          <NavItem icon="📚" label="Docs" href="#" />
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
        <div className="sticky top-0 z-10 bg-[#080B14]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <span>Agent Windtunnel</span>
                <span className="text-gray-700">›</span>
                <span className="text-gray-400">API Keys</span>
              </nav>
              <h1 className="text-xl font-semibold text-gray-50 tracking-tight">API Keys</h1>
            </div>
            <button
              onClick={() => {
                setShowForm(true)
                setNewProject(null)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium shadow-lg shadow-purple-500/20 transition-all"
            >
              <span className="text-base leading-none">+</span>
              New Project
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* New key reveal banner */}
          {newProject && (
            <NewKeyRevealCard
              project={newProject}
              onDismiss={() => setNewProject(null)}
            />
          )}

          {/* Create project form */}
          {showForm && (
            <CreateProjectForm
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#0D1117] border border-white/[0.08] rounded-xl p-5 animate-pulse"
                >
                  <div className="h-4 w-40 rounded bg-white/[0.06] mb-2" />
                  <div className="h-3 w-64 rounded bg-white/[0.04] mb-4" />
                  <div className="h-9 w-full rounded-lg bg-white/[0.03]" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && projects.length === 0 && !showForm && (
            <div className="bg-[#0D1117] border border-white/[0.08] rounded-xl overflow-hidden">
              <EmptyState onNew={() => setShowForm(true)} />
            </div>
          )}

          {/* Projects list */}
          {!loading && projects.length > 0 && (
            <div className="space-y-3 mb-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Integration snippet — always shown when not loading */}
          {!loading && (
            <IntegrationSnippet />
          )}
        </div>
      </main>
    </div>
  )
}
