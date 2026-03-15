'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Run } from '@/lib/supabase'

export default function HomePage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRuns()
    const interval = setInterval(fetchRuns, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchRuns() {
    try {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRuns(data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch runs')
    } finally {
      setLoading(false)
    }
  }

  function getRegressionRate(run: Run) {
    if (run.total_interactions === 0) return 0
    return Math.round((run.failed / run.total_interactions) * 100)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const completedRuns = runs.filter(r => r.status === 'completed')
  const blockedCount = runs.filter(r => r.verdict === 'BLOCKED').length
  const approvedCount = runs.filter(r => r.verdict === 'APPROVED').length
  const avgRegressionRate =
    completedRuns.length > 0
      ? Math.round(
          completedRuns.reduce((acc, r) => acc + getRegressionRate(r), 0) /
            completedRuns.length
        )
      : 0

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navigation */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
              WT
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Agent Windtunnel</span>
              <span className="ml-2 text-xs text-gray-500 font-medium">CI/CD for AI Agents</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-white font-medium border-b border-purple-500 pb-0.5"
            >
              Runs
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors font-medium"
            >
              Docs
            </Link>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-green-400">Live</span>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Windtunnel Runs
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Every time you change your agent prompt or model, Windtunnel replays
            production interactions through both versions and automatically flags regressions — before they reach users.
          </p>
        </div>

        {/* SDK Quickstart */}
        <div className="mb-10 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
            </div>
            <span className="text-xs text-gray-500 font-mono">quickstart.py</span>
            <div className="w-16"></div>
          </div>
          <div className="bg-gray-900/60 px-6 py-5 font-mono text-sm leading-7 overflow-x-auto">
            <div>
              <span className="text-purple-400">from</span>
              <span className="text-gray-300"> windtunnel </span>
              <span className="text-purple-400">import</span>
              <span className="text-gray-300"> WindTunnel</span>
            </div>
            <div className="mt-1">
              <span className="text-gray-300">wt </span>
              <span className="text-gray-500">=</span>
              <span className="text-blue-400"> WindTunnel</span>
              <span className="text-gray-300">(api_key</span>
              <span className="text-gray-500">=</span>
              <span className="text-green-400">&quot;your-key&quot;</span>
              <span className="text-gray-300">)</span>
            </div>
            <div className="mt-4">
              <span className="text-gray-600"># Record production interactions</span>
            </div>
            <div>
              <span className="text-gray-300">wt.</span>
              <span className="text-blue-400">record</span>
              <span className="text-gray-300">(user_input</span>
              <span className="text-gray-500">=</span>
              <span className="text-gray-300">query, agent_output</span>
              <span className="text-gray-500">=</span>
              <span className="text-gray-300">response)</span>
            </div>
            <div className="mt-4">
              <span className="text-gray-600"># Before deploying new prompt → run windtunnel</span>
            </div>
            <div>
              <span className="text-gray-300">result </span>
              <span className="text-gray-500">=</span>
              <span className="text-gray-300"> wt.</span>
              <span className="text-blue-400">run_windtunnel</span>
              <span className="text-gray-300">(</span>
            </div>
            <div>
              <span className="text-gray-300">&nbsp;&nbsp;&nbsp;&nbsp;baseline_prompt</span>
              <span className="text-gray-500">=</span>
              <span className="text-gray-300">current_prompt,</span>
            </div>
            <div>
              <span className="text-gray-300">&nbsp;&nbsp;&nbsp;&nbsp;challenger_prompt</span>
              <span className="text-gray-500">=</span>
              <span className="text-gray-300">new_prompt</span>
            </div>
            <div>
              <span className="text-gray-300">)</span>
            </div>
            <div className="mt-4">
              <span className="text-gray-600"># → BLOCKED if regressions detected</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {runs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: 'Total Runs',
                value: runs.length,
                color: 'text-white',
                glowColor: 'hover:border-gray-600 hover:shadow-gray-700/20',
                icon: null,
              },
              {
                label: 'Blocked',
                value: blockedCount,
                color: 'text-red-400',
                glowColor: 'hover:border-red-500/40 hover:shadow-red-500/10',
                icon: '🚫',
              },
              {
                label: 'Approved',
                value: approvedCount,
                color: 'text-green-400',
                glowColor: 'hover:border-green-500/40 hover:shadow-green-500/10',
                icon: '✅',
              },
              {
                label: 'Avg Regression Rate',
                value: `${avgRegressionRate}%`,
                color: 'text-yellow-400',
                glowColor: 'hover:border-yellow-500/40 hover:shadow-yellow-500/10',
                icon: null,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-gray-900 border border-gray-800 rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${stat.glowColor} cursor-default`}
              >
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-3xl font-extrabold ${stat.color} flex items-center gap-2`}>
                  {stat.icon && <span className="text-2xl">{stat.icon}</span>}
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-500">
            <div className="w-9 h-9 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-5"></div>
            <p className="text-sm font-medium">Loading runs…</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-semibold text-lg mb-2">Failed to load runs</p>
            <p className="text-red-400/70 text-sm mb-3">{error}</p>
            <p className="text-gray-500 text-xs">
              Make sure you have applied the database schema in Supabase Dashboard.
            </p>
          </div>
        ) : runs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-800/80 flex items-center justify-center mb-5 text-4xl shadow-inner">
              🌪️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No runs yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              Run the demo agent to create your first Windtunnel test and see regressions get caught automatically.
            </p>
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-5 py-3 font-mono text-sm text-purple-300 flex items-center gap-3">
              <span className="text-gray-600 select-none">$</span>
              <span>python demo/demo_agent.py</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">
              {runs.length} run{runs.length !== 1 ? 's' : ''} · auto-refreshing every 10s
            </p>
            {runs.map((run) => {
              const regressionRate = getRegressionRate(run)
              const isBlocked = run.verdict === 'BLOCKED'
              const isApproved = run.verdict === 'APPROVED'
              const isRunning = run.status === 'running'

              return (
                <Link key={run.id} href={`/run/${run.id}`}>
                  <div className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden">
                    {/* Purple left border on hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-2xl"></div>

                    <div className="flex items-start justify-between gap-6">
                      {/* Left: verdict + name + versions */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {/* Verdict badge */}
                          {isRunning ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                              RUNNING
                            </span>
                          ) : isBlocked ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/10">
                              🚫 BLOCKED
                            </span>
                          ) : isApproved ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30 shadow-sm shadow-green-500/10">
                              ✅ APPROVED
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-700/40 text-gray-400 border border-gray-700">
                              PENDING
                            </span>
                          )}

                          <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-base">
                            {run.name || `Run ${run.id.slice(0, 8)}`}
                          </h3>
                        </div>

                        {/* Versions + timestamp */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                          <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded text-blue-400 border border-gray-700/50">
                            {run.baseline_version}
                          </span>
                          <span className="text-gray-600 font-light">→</span>
                          <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded text-purple-400 border border-gray-700/50">
                            {run.challenger_version}
                          </span>
                          <span className="text-gray-700">·</span>
                          <span className="text-gray-600 text-xs">{formatDate(run.created_at)}</span>
                        </div>

                        {/* Regression rate bar */}
                        {run.status === 'completed' && run.total_interactions > 0 && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 max-w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500/80 rounded-full transition-all duration-500"
                                style={{ width: `${regressionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">
                              {regressionRate}% regression
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: stats */}
                      {run.status === 'completed' && (
                        <div className="flex items-center gap-5 flex-shrink-0 text-center">
                          <div>
                            <p className="text-xl font-extrabold text-green-400">{run.passed}</p>
                            <p className="text-xs text-gray-600 mt-0.5">better</p>
                          </div>
                          <div>
                            <p className="text-xl font-extrabold text-red-400">{run.failed}</p>
                            <p className="text-xs text-gray-600 mt-0.5">worse</p>
                          </div>
                          <div>
                            <p className="text-xl font-extrabold text-gray-400">{run.neutral}</p>
                            <p className="text-xs text-gray-600 mt-0.5">neutral</p>
                          </div>
                          <div className="text-gray-700 group-hover:text-purple-400 transition-colors pl-2">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
