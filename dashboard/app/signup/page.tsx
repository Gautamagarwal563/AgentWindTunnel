'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080B14] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0D1117] border border-white/10 rounded-2xl p-8">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30 mb-4">
            WT
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Agent Windtunnel</h1>
          <p className="text-sm text-gray-500 mt-1">CI/CD for AI Agents</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✉️</div>
            <h2 className="text-base font-semibold text-white">Check your email</h2>
            <p className="text-sm text-gray-400">
              Check your email to confirm your account. Once confirmed, you can{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                sign in
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white w-full focus:border-purple-500 outline-none placeholder-gray-600 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white w-full focus:border-purple-500 outline-none placeholder-gray-600 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white w-full focus:border-purple-500 outline-none placeholder-gray-600 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-widest">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white w-full focus:border-purple-500 outline-none placeholder-gray-600 text-sm transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in →
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
