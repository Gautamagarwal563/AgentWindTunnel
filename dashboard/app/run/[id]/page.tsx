'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase, type Run, type RunResult } from '@/lib/supabase'

export default function RunDetailPage() {
  const params = useParams()
  const runId = params.id as string

  const [run, setRun] = useState<Run | null>(null)
  const [results, setResults] = useState<RunResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const fetchRunData = useCallback(async () => {
    try {
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .select('*')
        .eq('id', runId)
        .single()

      if (runError) throw runError
      setRun(runData)

      const { data: resultsData, error: resultsError } = await supabase
        .from('run_results')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true })

      if (resultsError) throw resultsError
      setResults(resultsData || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch run data')
    } finally {
      setLoading(false)
    }
  }, [runId])

  useEffect(() => {
    if (runId) {
      fetchRunData()
    }
  }, [runId, fetchRunData])

  // Auto-refresh every 5 seconds if run is still running
  useEffect(() => {
    if (!run || run.status !== 'running') return

    const interval = setInterval(() => {
      fetchRunData()
    }, 5000)

    return () => clearInterval(interval)
  }, [run, fetchRunData])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm tracking-wide">Loading run details…</p>
        </div>
      </div>
    )
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-10 text-center max-w-md">
          <p className="text-red-400 font-semibold text-lg mb-2">Failed to load run</p>
          <p className="text-red-400/60 text-sm mb-6">{error || 'Run not found'}</p>
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
            ← Back to all runs
          </Link>
        </div>
      </div>
    )
  }

  const regressionRate =
    run.total_interactions > 0
      ? Math.round((run.failed / run.total_interactions) * 100)
      : 0

  const isBlocked = run.verdict === 'BLOCKED'
  const isApproved = run.verdict === 'APPROVED'
  const isRunning = run.status === 'running'

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Header ── */}
      <header className="border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
              WT
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Agent Windtunnel</h1>
              <p className="text-[11px] text-gray-500 leading-tight">CI/CD for AI Agents</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isRunning && (
              <span className="inline-flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Live — refreshing every 5s
              </span>
            )}
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-200 transition-colors flex items-center gap-1.5 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg"
            >
              ← All Runs
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* ── Verdict Banner ── */}
        <section
          className={`rounded-2xl border overflow-hidden ${
            isBlocked
              ? 'bg-red-950/50 border-red-800/60'
              : isApproved
              ? 'bg-green-950/40 border-green-800/50'
              : 'bg-gray-900/60 border-gray-800'
          }`}
        >
          <div className="p-8 flex flex-col sm:flex-row items-start justify-between gap-8">
            {/* Left: verdict text */}
            <div className="flex-1 min-w-0">
              <div className="text-6xl mb-4 leading-none select-none">
                {isBlocked ? '🚫' : isApproved ? '✅' : '⚠️'}
              </div>
              <h2
                className={`text-4xl font-extrabold tracking-tight mb-3 ${
                  isBlocked
                    ? 'text-red-400'
                    : isApproved
                    ? 'text-green-400'
                    : 'text-gray-300'
                }`}
              >
                {isBlocked
                  ? 'DEPLOY BLOCKED'
                  : isApproved
                  ? 'DEPLOY APPROVED'
                  : isRunning
                  ? 'RUN IN PROGRESS'
                  : 'DEPLOY NEUTRAL'}
              </h2>
              <p
                className={`text-base leading-relaxed mb-3 ${
                  isBlocked
                    ? 'text-red-300/80'
                    : isApproved
                    ? 'text-green-300/80'
                    : 'text-gray-400'
                }`}
              >
                {isBlocked
                  ? `${run.failed}/${run.total_interactions} interactions regressed — new prompt is worse`
                  : isApproved
                  ? `${run.passed}/${run.total_interactions} interactions improved — safe to deploy`
                  : isRunning
                  ? `${run.total_interactions} interactions tested so far…`
                  : `No significant change detected across ${run.total_interactions} interactions`}
              </p>
              {run.name && (
                <p className="text-sm text-gray-500 font-mono">{run.name}</p>
              )}
            </div>

            {/* Right: 2×2 metric grid */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full sm:w-auto sm:min-w-[280px]">
              {/* Regressions */}
              <div
                className={`rounded-xl p-4 text-center border ${
                  run.failed > 0
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-gray-800/60 border-gray-700/60'
                }`}
              >
                <p className="text-3xl font-bold text-red-400">{run.failed}</p>
                <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Regressions</p>
              </div>

              {/* Improvements */}
              <div
                className={`rounded-xl p-4 text-center border ${
                  run.passed > 0
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-gray-800/60 border-gray-700/60'
                }`}
              >
                <p className="text-3xl font-bold text-green-400">{run.passed}</p>
                <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Improvements</p>
              </div>

              {/* Neutral */}
              <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-gray-400">{run.neutral}</p>
                <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Neutral</p>
              </div>

              {/* Regression Rate */}
              <div
                className={`rounded-xl p-4 text-center border ${
                  regressionRate >= 30
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/15'
                }`}
              >
                <p
                  className={`text-3xl font-bold ${
                    regressionRate >= 30 ? 'text-red-400' : 'text-yellow-400'
                  }`}
                >
                  {regressionRate}%
                </p>
                <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Regression Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Prompt Comparison ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Prompt Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Baseline Prompt</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30">
                    {run.baseline_version}
                  </span>
                  <span className="text-xs text-gray-600">{run.baseline_model}</span>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-5"
                style={{ maxHeight: '200px' }}
              >
                <pre className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                  {run.baseline_prompt}
                </pre>
              </div>
            </div>

            {/* Challenger */}
            <div
              className={`border rounded-2xl overflow-hidden flex flex-col ${
                isBlocked
                  ? 'bg-red-950/20 border-red-800/40'
                  : 'bg-gray-900/80 border-gray-800'
              }`}
            >
              <div className="px-5 py-4 border-b border-gray-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Challenger Prompt</span>
                  {isBlocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                      ⚠️ This prompt was blocked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md border border-purple-500/30">
                    {run.challenger_version}
                  </span>
                  <span className="text-xs text-gray-600">{run.challenger_model}</span>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-5"
                style={{ maxHeight: '200px' }}
              >
                <pre className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                  {run.challenger_prompt}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Interaction Results ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Interaction Results
            </h3>
            <span className="text-xs text-gray-600">
              {results.length} interaction{results.length !== 1 ? 's' : ''} tested
            </span>
          </div>

          <div className="space-y-2">
            {results.map((result, index) => {
              const isExpanded = expandedRow === result.id
              const isWorse = result.score === 'worse'
              const isBetter = result.score === 'better'

              return (
                <div
                  key={result.id}
                  className={`rounded-xl overflow-hidden border transition-all duration-200 ${
                    isWorse
                      ? 'border-red-500/30 bg-gray-900/80'
                      : isBetter
                      ? 'border-green-500/20 bg-gray-900/80'
                      : 'border-gray-800/80 bg-gray-900/60'
                  }`}
                  style={
                    isWorse
                      ? { borderLeftWidth: '3px', borderLeftColor: 'rgb(239 68 68 / 0.7)' }
                      : isBetter
                      ? { borderLeftWidth: '3px', borderLeftColor: 'rgb(34 197 94 / 0.5)' }
                      : {}
                  }
                >
                  {/* Row header */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    onClick={() =>
                      setExpandedRow(isExpanded ? null : result.id)
                    }
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-gray-600 text-xs font-mono w-6 flex-shrink-0 text-right">
                        #{index + 1}
                      </span>
                      <p className="text-sm text-gray-200 truncate font-medium">
                        {result.user_input}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Score badge */}
                      {isWorse ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wide">
                          ✕ Worse
                        </span>
                      ) : isBetter ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 uppercase tracking-wide">
                          ↑ Better
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-700/60 text-gray-400 border border-gray-700 uppercase tracking-wide">
                          — Neutral
                        </span>
                      )}
                      <span
                        className={`text-gray-600 text-xs transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-800/80">
                      {/* Response columns */}
                      <div className="grid grid-cols-2 divide-x divide-gray-800/80">
                        {/* Baseline */}
                        <div className="flex flex-col">
                          <div className="px-5 py-3 bg-blue-950/20 border-b border-gray-800/60 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500/60" />
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                              Baseline Response
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-blue-500/60 bg-blue-500/10 px-1.5 py-0.5 rounded">
                              {run.baseline_version}
                            </span>
                          </div>
                          <div className="p-5">
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {result.baseline_output}
                            </p>
                          </div>
                        </div>

                        {/* Challenger */}
                        <div className="flex flex-col">
                          <div
                            className={`px-5 py-3 border-b border-gray-800/60 flex items-center gap-2 ${
                              isWorse
                                ? 'bg-red-950/20'
                                : isBetter
                                ? 'bg-green-950/20'
                                : 'bg-gray-800/20'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isWorse
                                  ? 'bg-red-500/60'
                                  : isBetter
                                  ? 'bg-green-500/60'
                                  : 'bg-gray-500/60'
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold uppercase tracking-wider ${
                                isWorse
                                  ? 'text-red-400'
                                  : isBetter
                                  ? 'text-green-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              Challenger Response
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-purple-500/60 bg-purple-500/10 px-1.5 py-0.5 rounded">
                              {run.challenger_version}
                            </span>
                          </div>
                          <div
                            className={`p-5 flex-1 ${
                              isWorse
                                ? 'bg-red-500/[0.03]'
                                : isBetter
                                ? 'bg-green-500/[0.03]'
                                : ''
                            }`}
                          >
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {result.challenger_output}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Judge reasoning */}
                      {result.reasoning && (
                        <div className="border-t border-gray-800/60 px-5 py-4 bg-gray-950/40 flex gap-3">
                          <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                          <p className="text-xs text-gray-500 italic leading-relaxed">
                            <span className="not-italic font-semibold text-gray-400">Judge Reasoning: </span>
                            {result.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {results.length === 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 py-16 text-center">
                <p className="text-gray-600 text-sm">
                  {isRunning ? 'Waiting for interaction results…' : 'No results found for this run.'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-6 border-t border-gray-800/60">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600 font-mono">
            <span>
              <span className="text-gray-700">Run ID </span>
              {run.id}
            </span>
            <span>
              <span className="text-gray-700">Created </span>
              {formatDate(run.created_at)}
            </span>
            {run.completed_at && (
              <span>
                <span className="text-gray-700">Completed </span>
                {formatDate(run.completed_at)}
              </span>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
