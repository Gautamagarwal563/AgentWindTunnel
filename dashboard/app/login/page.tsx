'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

// ── Terminal animation ───────────────────────────────────────────────────────

const BLOCKED_RUN = [
  { text: '$ windtunnel check --fail-on-regression', color: '#555', delay: 0 },
  { text: '', color: '#555', delay: 300 },
  { text: '  Fetching 20 production interactions...', color: '#444', delay: 600 },
  { text: '  Testing challenger prompt v2...', color: '#444', delay: 1200 },
  { text: '  LLM judge scoring responses...', color: '#444', delay: 1900 },
  { text: '', color: '#444', delay: 2600 },
  { text: '🚫  DEPLOY BLOCKED', color: '#ef4444', delay: 3000, bold: true },
  { text: '    16/20 interactions regressed (80%)', color: '#f87171', delay: 3200 },
  { text: '    Exit code: 1', color: '#666', delay: 3500 },
]

const APPROVED_RUN = [
  { text: '$ windtunnel check --fail-on-regression', color: '#555', delay: 0 },
  { text: '', color: '#555', delay: 300 },
  { text: '  Fetching 20 production interactions...', color: '#444', delay: 600 },
  { text: '  Testing challenger prompt v3...', color: '#444', delay: 1200 },
  { text: '  LLM judge scoring responses...', color: '#444', delay: 1900 },
  { text: '', color: '#444', delay: 2600 },
  { text: '✅  DEPLOY APPROVED', color: '#22c55e', delay: 3000, bold: true },
  { text: '    2/20 interactions regressed (10%)', color: '#86efac', delay: 3200 },
  { text: '    Exit code: 0', color: '#666', delay: 3500 },
]

function TerminalPanel() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [runIndex, setRunIndex] = useState(0)
  const currentRun = runIndex % 2 === 0 ? BLOCKED_RUN : APPROVED_RUN

  useEffect(() => {
    setVisibleLines(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    currentRun.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay))
    })
    timers.push(setTimeout(() => setRunIndex(r => r + 1), 6500))
    return () => timers.forEach(clearTimeout)
  }, [runIndex])

  return (
    <div className="flex flex-col justify-between h-full px-10 py-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
        <span className="text-sm font-semibold tracking-tight text-white">Windtunnel</span>
      </div>

      <div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-2 leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#fff' }}
        >
          The deploy gate<br /><span style={{ color: '#0A5CF5' }}>for AI agents.</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm mb-8" style={{ color: '#444' }}>
          Catch prompt regressions before they reach users.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
          <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: '#111', borderBottom: '1px solid #1a1a1a' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            <span className="ml-2 text-[10px] font-mono" style={{ color: '#444' }}>zsh — windtunnel</span>
            <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: runIndex % 2 === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: runIndex % 2 === 0 ? '#ef4444' : '#22c55e' }}>
              {runIndex % 2 === 0 ? 'BLOCKED' : 'APPROVED'}
            </span>
          </div>
          <div className="px-4 py-4 font-mono text-xs leading-6 min-h-[200px]" style={{ background: '#080808' }}>
            <AnimatePresence mode="wait">
              <motion.div key={runIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {currentRun.slice(0, visibleLines).map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                    style={{ color: line.color, fontWeight: line.bold ? 700 : 400 }}>
                    {line.text || '\u00A0'}
                  </motion.div>
                ))}
                {visibleLines > 0 && visibleLines < currentRun.length && (
                  <span className="cursor-blink" style={{ color: '#555' }}>█</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[11px]" style={{ color: '#444' }}>Open source · MIT License</span>
      </div>
    </div>
  )
}

// ── Login form (needs Suspense for useSearchParams) ──────────────────────────

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    window.location.href = from
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[360px]">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Welcome back</h1>
        <p className="text-sm" style={{ color: '#555' }}>Sign in to your Windtunnel account</p>
      </div>

      {/* Demo button */}
      <Link href="/demo">
        <button className="w-full flex items-center justify-center gap-2.5 h-10 rounded-lg text-sm font-medium mb-6 transition-all"
          style={{ border: '1px solid #1a1a1a', color: '#888', background: '#0a0a0a' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#888' }}
        ><span>▶</span> Try Demo — no account needed</button>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: '#111' }} />
        <span className="text-[11px]" style={{ color: '#333' }}>or sign in with email</span>
        <div className="flex-1 h-px" style={{ background: '#111' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#444' }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
            className="w-full h-10 px-3.5 rounded-lg text-sm text-white placeholder:text-[#2a2a2a] outline-none transition-all"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,92,245,0.08)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.boxShadow = 'none' }} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#444' }}>Password</label>
            <a href="#" className="text-[10px] transition-colors" style={{ color: '#444' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#444' }}>Forgot password?</a>
          </div>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full h-10 px-3.5 rounded-lg text-sm text-white placeholder:text-[#2a2a2a] outline-none transition-all"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,92,245,0.08)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.boxShadow = 'none' }} />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="text-xs rounded-lg px-3 py-2.5"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <button type="submit" disabled={loading}
          className="w-full h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: '#fff', color: '#000' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e8e8e8' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: '#444' }}>
        No account?{' '}
        <Link href="/signup" className="text-white underline underline-offset-4 decoration-[#333] hover:decoration-white transition-colors">
          Create one free
        </Link>
      </p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#050505' }}>
      <div className="hidden lg:flex lg:w-[55%] relative" style={{ borderRight: '1px solid #0f0f0f' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <TerminalPanel />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
          <span className="text-sm font-semibold text-white">Windtunnel</span>
        </div>
        <Suspense fallback={<div className="w-full max-w-[360px]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
