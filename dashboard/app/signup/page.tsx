'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

// ── Left branding panel ─────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Record',
    desc: 'Capture real user interactions in production with 2 lines of code.',
    code: `wt.record(\n  user_input=msg,\n  agent_output=resp\n)`,
  },
  {
    num: '02',
    title: 'Test',
    desc: 'Replay interactions through both prompts and score the results.',
    code: `windtunnel check \\\n  --baseline v1 \\\n  --challenger v2`,
  },
  {
    num: '03',
    title: 'Block',
    desc: 'CI fails automatically if regression exceeds your threshold.',
    code: `🚫  DEPLOY BLOCKED\n    80% regression rate\n    Exit code: 1`,
  },
]

function BrandingPanel() {
  const [active, setActive] = useState(0)

  useState(() => {
    const interval = setInterval(() => setActive(a => (a + 1) % 3), 3000)
    return () => clearInterval(interval)
  })

  return (
    <div className="flex flex-col justify-between h-full px-10 py-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
        <span className="text-sm font-semibold tracking-tight text-white">Windtunnel</span>
      </div>

      {/* Center */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-2 leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#fff' }}
        >
          Protect every<br />
          <span style={{ color: '#0A5CF5' }}>prompt change.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm mb-8"
          style={{ color: '#444' }}
        >
          Set up in under 2 minutes. Free forever for small teams.
        </motion.p>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl p-4 cursor-pointer transition-all duration-300"
              style={{
                background: active === i ? 'rgba(10,92,245,0.06)' : '#0a0a0a',
                border: active === i ? '1px solid rgba(10,92,245,0.2)' : '1px solid #111',
              }}
              onClick={() => setActive(i)}
            >
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-black tracking-widest mt-0.5 shrink-0"
                  style={{ color: active === i ? '#0A5CF5' : '#333' }}>{step.num}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: active === i ? '#fff' : '#555' }}>{step.title}</span>
                  </div>
                  <AnimatePresence>
                    {active === i && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}>
                        <p className="text-xs mb-2" style={{ color: '#555' }}>{step.desc}</p>
                        <pre className="font-mono text-[11px] leading-relaxed rounded-lg px-3 py-2"
                          style={{ background: '#060606', border: '1px solid #1a1a1a', color: '#666' }}>{step.code}</pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex items-center gap-4">
        <span className="text-[11px]" style={{ color: '#333' }}>Free · Open Source</span>
      </div>
    </div>
  )
}

// ── Main Signup Page ─────────────────────────────────────────────────────────

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (authError) { setError(authError.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  const inputProps = (onFocus?: () => void) => ({
    className: "w-full h-10 px-3.5 rounded-lg text-sm text-white placeholder:text-[#2a2a2a] outline-none transition-all",
    style: { background: '#0a0a0a', border: '1px solid #1a1a1a' } as React.CSSProperties,
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = '#2a2a2a'
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,92,245,0.08)'
      onFocus?.()
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = '#1a1a1a'
      e.currentTarget.style.boxShadow = 'none'
    },
  })

  return (
    <div className="min-h-screen flex" style={{ background: '#050505' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] relative" style={{ borderRight: '1px solid #0f0f0f' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <BrandingPanel />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">WT</div>
          <span className="text-sm font-semibold text-white">Windtunnel</span>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[360px] text-center"
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>✅</div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#555' }}>
                We sent a confirmation link to <span className="text-white font-medium">{email}</span>.<br />
                Confirm it, then sign in.
              </p>
              <Link href="/login">
                <button className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: '#fff', color: '#000' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                >Go to sign in →</button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[360px]"
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Create account</h1>
                <p className="text-sm" style={{ color: '#555' }}>Free forever · No credit card required</p>
              </div>

              {/* Demo shortcut */}
              <button
                onClick={() => window.location.href = '/demo'}
                className="w-full flex items-center justify-center gap-2.5 h-10 rounded-lg text-sm font-medium mb-6 transition-all"
                style={{ border: '1px solid #1a1a1a', color: '#888', background: '#0a0a0a' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#888' }}
              >
                <span style={{ fontSize: '15px' }}>▶</span>
                Try Demo first — no signup
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: '#111' }} />
                <span className="text-[11px]" style={{ color: '#333' }}>or create a free account</span>
                <div className="flex-1 h-px" style={{ background: '#111' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#444' }}>Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" {...inputProps()} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#444' }}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" {...inputProps()} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#444' }}>Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" {...inputProps()} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest block" style={{ color: '#444' }}>Confirm</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" {...inputProps()} />
                  </div>
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
                  style={{ background: '#0A5CF5', color: '#fff', boxShadow: '0 2px 16px rgba(10,92,245,0.3)' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0848c4' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0A5CF5' }}
                >
                  {loading ? 'Creating account…' : 'Create Free Account →'}
                </button>

                <p className="text-[10px] text-center leading-relaxed" style={{ color: '#333' }}>
                  Free forever for open source projects.
                </p>
              </form>

              <p className="text-center text-xs mt-5" style={{ color: '#444' }}>
                Already have an account?{' '}
                <Link href="/login" className="text-white underline underline-offset-4 decoration-[#333] hover:decoration-white transition-colors">Sign in →</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
