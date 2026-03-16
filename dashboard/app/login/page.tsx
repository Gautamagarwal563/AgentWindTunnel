'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo mark above card */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30 mb-4">
            WT
          </div>
          <h1 className="text-base font-semibold text-white tracking-tight">Agent Windtunnel</h1>
          <p className="text-xs text-gray-500 mt-0.5">CI/CD for AI Agents</p>
        </div>

        <Card className="bg-[#0a0d14] border-white/[0.06] w-full">
          <CardHeader className="border-b border-white/[0.06]">
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your Windtunnel account
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20 h-9"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-violet-600 hover:bg-violet-700 text-white font-medium mt-1 border-transparent"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Sign up →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
