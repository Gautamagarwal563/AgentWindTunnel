'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (authError) { setError(authError.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  const inputClass = "bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-[#333] focus-visible:border-[#444] focus-visible:ring-0 h-9"
  const labelClass = "text-[10px] font-semibold text-[#444] uppercase tracking-widest"

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black font-bold text-sm mb-4">WT</div>
          <h1 className="text-base font-semibold text-white tracking-tight">Agent Windtunnel</h1>
          <p className="text-xs text-[#444] mt-0.5">CI/CD for AI Agents</p>
        </div>

        {success ? (
          <div className="bg-[#0a0a0a] border border-[#22c55e]/20 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-2xl">✅</div>
              <div>
                <h2 className="text-base font-semibold text-white">Check your email</h2>
                <p className="text-sm text-[#555] mt-1.5 leading-relaxed">
                  We sent a confirmation link to <span className="text-white font-medium">{email}</span>. Confirm your account, then{' '}
                  <Link href="/login" className="text-white underline underline-offset-4 decoration-[#333] hover:decoration-white transition-colors">sign in</Link>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#111]">
              <h2 className="text-base font-semibold text-white">Create an account</h2>
              <p className="text-xs text-[#444] mt-0.5">Start testing your AI agents today</p>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className={labelClass}>Full Name</Label>
                  <Input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className={labelClass}>Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className={labelClass}>Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                  <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
                {error && <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2.5">{error}</p>}
                <button type="submit" disabled={loading} className="w-full h-9 bg-white text-black font-semibold rounded-lg hover:bg-[#e5e5e5] transition-colors text-sm disabled:opacity-50 mt-1">
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-xs text-[#444] mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-white underline underline-offset-4 decoration-[#333] hover:decoration-white transition-colors">Sign in →</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
