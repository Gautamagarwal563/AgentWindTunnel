'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Score = 'better' | 'worse' | 'neutral'

interface ResultRow {
  id: string
  user_input: string
  baseline_output: string
  challenger_output: string
  score: Score
  reasoning: string
}

const DEMO_RESULTS: ResultRow[] = [
  {
    id: '1',
    user_input: 'How do I reset my password?',
    baseline_output: 'To reset your password, go to Settings > Security > Reset Password. You\'ll receive an email with a link.',
    challenger_output: 'Click "Forgot Password" on the login page and enter your email. We\'ll send you a reset link.',
    score: 'worse',
    reasoning: 'Challenger response omits the Settings path which is the primary method for logged-in users. The baseline correctly identifies the in-app flow while challenger only covers the logged-out flow.',
  },
  {
    id: '2',
    user_input: 'What payment methods do you accept?',
    baseline_output: 'We accept Visa, Mastercard, American Express, and PayPal.',
    challenger_output: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay.',
    score: 'better',
    reasoning: 'Challenger adds Apple Pay which is a supported method the baseline missed, and uses clearer grouping.',
  },
  {
    id: '3',
    user_input: 'Can I export my data?',
    baseline_output: 'Yes, you can export your data from Account Settings.',
    challenger_output: 'Data export is currently unavailable for your plan.',
    score: 'worse',
    reasoning: 'Challenger incorrectly states data export is unavailable. The baseline correctly directs users to Account Settings where export functionality exists on all plans.',
  },
  {
    id: '4',
    user_input: 'How long does shipping take?',
    baseline_output: 'Standard shipping takes 5-7 business days. Express shipping is 2-3 business days.',
    challenger_output: 'Shipping typically takes 5-7 business days for standard, or 2-3 days for express. International orders may take up to 14 days.',
    score: 'better',
    reasoning: 'Challenger adds useful international shipping info that baseline lacks.',
  },
  {
    id: '5',
    user_input: 'Do you offer a free trial?',
    baseline_output: 'Yes, we offer a 14-day free trial with no credit card required.',
    challenger_output: 'We offer a free trial period.',
    score: 'worse',
    reasoning: 'Challenger is vague — omits the 14-day duration and the key "no credit card required" selling point. Baseline is significantly more informative and persuasive.',
  },
  {
    id: '6',
    user_input: 'How do I contact support?',
    baseline_output: 'Contact support via email at support@company.com or through the in-app chat.',
    challenger_output: 'You can reach our support team through the chat widget in the bottom-right corner of the app, or email us at support@company.com. We typically respond within 2 hours.',
    score: 'better',
    reasoning: 'Challenger adds response time expectation which sets better user expectations.',
  },
  {
    id: '7',
    user_input: 'Is my data secure?',
    baseline_output: 'Yes, we use industry-standard encryption to protect your data.',
    challenger_output: 'Your data is encrypted. Security is important to us.',
    score: 'worse',
    reasoning: 'Challenger is vague and sounds dismissive. Baseline specifically mentions industry-standard encryption which builds more trust.',
  },
  {
    id: '8',
    user_input: 'Can I change my subscription plan?',
    baseline_output: 'Yes, you can upgrade or downgrade your plan anytime from Billing Settings.',
    challenger_output: 'Plan changes can be made in your account settings under Billing.',
    score: 'neutral',
    reasoning: 'Both responses are adequate. Challenger slightly less specific about upgrade/downgrade direction.',
  },
]

const MOCK_LIVE_RESULTS: ResultRow[] = [
  {
    id: 'l1',
    user_input: 'How do I cancel my subscription?',
    baseline_output: 'Cancel your subscription in Account Settings > Billing > Cancel Plan.',
    challenger_output: 'To cancel your subscription, go to Account Settings, then Billing, and click "Cancel Plan." You\'ll keep access until the end of your billing period. If you have any questions or need help, our support team is happy to assist you through this process — just reach out via the chat widget.',
    score: 'better',
    reasoning: 'Challenger provides the same core navigation path but adds important detail about continued access through the billing period, plus a support offer. The thorough approach reduces follow-up questions and improves user confidence.',
  },
  {
    id: 'l2',
    user_input: 'What payment methods do you accept?',
    baseline_output: 'We accept Visa, Mastercard, American Express, and PayPal.',
    challenger_output: 'Great question! We accept a variety of payment options including Visa, Mastercard, American Express, PayPal, and Apple Pay. Our payment processing is handled securely through Stripe, so your financial information is always protected. We\'re also exploring additional payment methods for the future!',
    score: 'better',
    reasoning: 'Challenger correctly includes Apple Pay and adds relevant security context. However the opening "Great question!" and speculative future roadmap comment are unnecessary padding that dilute the response quality.',
  },
]

const scoreColors = {
  better:  { bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.15)',  text: '#22c55e', badge: 'rgba(34,197,94,0.1)' },
  worse:   { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.15)',  text: '#ef4444', badge: 'rgba(239,68,68,0.1)' },
  neutral: { bg: 'rgba(107,107,107,0.06)',border: 'rgba(107,107,107,0.15)',text: '#9B9B9B', badge: 'rgba(107,107,107,0.1)' },
}

const scoreLabel: Record<Score, string> = { better: '✓ Better', worse: '✗ Worse', neutral: '— Neutral' }

function ResultsList({ results, baselineLabel, challengerLabel }: { results: ResultRow[]; baselineLabel: string; challengerLabel: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const worse   = results.filter(r => r.score === 'worse').length
  const better  = results.filter(r => r.score === 'better').length
  const neutral = results.filter(r => r.score === 'neutral').length
  const total   = results.length
  const regressionPct = Math.round((worse / total) * 100)
  const verdict = regressionPct >= 30 ? 'blocked' : 'approved'

  return (
    <div>
      {/* Verdict banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease }}
        className="rounded-xl px-6 py-5 mb-6 flex items-center gap-5 flex-wrap"
        style={verdict === 'blocked'
          ? { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }
          : { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }
        }
      >
        <span style={{ fontSize: '2rem' }}>{verdict === 'blocked' ? '🚫' : '✅'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="font-bold text-lg" style={{ color: verdict === 'blocked' ? '#fca5a5' : '#86efac' }}>
              {verdict === 'blocked' ? 'Deploy Blocked' : 'Approved to Deploy'}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={verdict === 'blocked'
                ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
                : { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
              }>
              {verdict === 'blocked' ? 'BLOCKED' : 'APPROVED'}
            </span>
          </div>
          <div className="text-sm" style={{ color: '#666' }}>
            {verdict === 'blocked'
              ? `${regressionPct}% regression rate — exceeds 30% threshold. Fix your challenger prompt before shipping.`
              : `${regressionPct}% regression rate — within the 30% threshold. Challenger is safe to ship.`
            }
          </div>
        </div>
        <div className="font-mono text-sm px-3 py-1.5 rounded-lg" style={{ background: '#0a0a0a', color: verdict === 'blocked' ? '#ef4444' : '#22c55e', border: '1px solid #1a1a1a' }}>
          exit code: {verdict === 'blocked' ? '1' : '0'}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: total, color: '#888' },
          { label: 'Regressed', value: worse, color: '#ef4444' },
          { label: 'Improved', value: better, color: '#22c55e' },
          { label: 'Neutral', value: neutral, color: '#555' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.07, duration: 0.4, ease }}
            className="rounded-xl p-4" style={{ background: '#0a0a0a', border: '1px solid #111' }}>
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#444' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Interactions list */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#444' }}>Interaction Results</h2>
        <div className="space-y-2">
          {results.map((result, i) => {
            const c = scoreColors[result.score]
            const isOpen = expanded === result.id
            return (
              <motion.div key={result.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease }}
                className="rounded-xl overflow-hidden cursor-pointer"
                style={{ background: '#0a0a0a', border: `1px solid ${isOpen ? c.border : '#111'}` }}
                onClick={() => setExpanded(isOpen ? null : result.id)}>
                <div className="px-5 py-3.5 flex items-center gap-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md shrink-0"
                    style={{ background: c.badge, color: c.text, border: `1px solid ${c.border}` }}>
                    {scoreLabel[result.score]}
                  </span>
                  <span className="text-sm flex-1 truncate" style={{ color: '#888' }}>{result.user_input}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 transition-transform duration-200"
                    style={{ color: '#333', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▾</span>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}>
                      <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid #111' }}>
                        <div className="grid md:grid-cols-2 gap-4 pt-4">
                          <div className="rounded-lg p-4" style={{ background: '#060606', border: '1px solid #111' }}>
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#333' }}>{baselineLabel}</div>
                            <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{result.baseline_output}</p>
                          </div>
                          <div className="rounded-lg p-4" style={{ background: '#060606', border: `1px solid ${c.border}` }}>
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c.text }}>{challengerLabel}</div>
                            <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{result.challenger_output}</p>
                          </div>
                        </div>
                        <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(10,92,245,0.04)', border: '1px solid rgba(10,92,245,0.1)' }}>
                          <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#0A5CF5' }}>LLM Judge Reasoning</div>
                          <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{result.reasoning}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LoadingPulse() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-20 flex flex-col items-center gap-6"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="w-14 h-14 rounded-full"
          style={{ border: '2px solid rgba(10,92,245,0.15)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
        />
        <motion.div
          className="absolute w-14 h-14 rounded-full"
          style={{ border: '2px solid transparent', borderTopColor: '#0A5CF5' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
        />
        <div className="absolute w-7 h-7 rounded-md bg-white flex items-center justify-center font-black text-[8px] text-black">WT</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-white mb-1">Running comparison…</div>
        <div className="text-xs" style={{ color: '#444' }}>Calling baseline · Calling challenger · Judging outputs</div>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#0A5CF5' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    </motion.div>
  )
}

type LiveState = 'idle' | 'loading' | 'done'

function TryItLive() {
  const [baseline, setBaseline] = useState('You are a helpful customer support agent. Be concise.')
  const [challenger, setChallenger] = useState('You are a friendly customer support agent. Be detailed and thorough.')
  const [inputs, setInputs] = useState(['How do I cancel my subscription?', 'What payment methods do you accept?'])
  const [liveState, setLiveState] = useState<LiveState>('idle')
  const resultsRef = useRef<HTMLDivElement>(null)

  function addInput() {
    if (inputs.length < 3) setInputs(prev => [...prev, ''])
  }

  function updateInput(idx: number, val: string) {
    setInputs(prev => prev.map((v, i) => (i === idx ? val : v)))
  }

  function removeInput(idx: number) {
    if (inputs.length > 1) setInputs(prev => prev.filter((_, i) => i !== idx))
  }

  function runComparison() {
    setLiveState('loading')
    setTimeout(() => {
      setLiveState('done')
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 2000)
  }

  const canRun = baseline.trim().length > 0 && challenger.trim().length > 0 && inputs.some(i => i.trim().length > 0)

  return (
    <div>
      {/* Form */}
      <AnimatePresence mode="wait">
        {liveState !== 'done' && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease }}>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Baseline */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#444' }}>
                  System Prompt — Baseline
                </label>
                <textarea
                  rows={5}
                  value={baseline}
                  onChange={e => setBaseline(e.target.value)}
                  placeholder="Your current production system prompt…"
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#ccc', lineHeight: '1.6' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#222' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
                />
              </div>
              {/* Challenger */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#0A5CF5' }}>
                  System Prompt — Challenger
                </label>
                <textarea
                  rows={5}
                  value={challenger}
                  onChange={e => setChallenger(e.target.value)}
                  placeholder="Your new experimental system prompt…"
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(10,92,245,0.2)', color: '#ccc', lineHeight: '1.6' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,92,245,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(10,92,245,0.2)' }}
                />
              </div>
            </div>

            {/* Test inputs */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#444' }}>
                Test Inputs
              </label>
              <div className="space-y-2.5">
                {inputs.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold shrink-0 w-5 text-right" style={{ color: '#333' }}>{idx + 1}</span>
                    <input
                      type="text"
                      value={val}
                      onChange={e => updateInput(idx, e.target.value)}
                      placeholder={`User message ${idx + 1}…`}
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#ccc' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#222' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
                    />
                    {inputs.length > 1 && (
                      <button onClick={() => removeInput(idx)}
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all"
                        style={{ color: '#333', border: '1px solid #1a1a1a' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#333'; e.currentTarget.style.borderColor = '#1a1a1a' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {inputs.length < 3 && (
                <button onClick={addInput}
                  className="mt-3 ml-7 text-xs font-medium transition-all flex items-center gap-1.5"
                  style={{ color: '#444' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#888' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#444' }}>
                  <span className="text-lg leading-none" style={{ marginTop: '-1px' }}>+</span> Add another input
                </button>
              )}
            </div>

            {/* Run button */}
            <div className="flex items-center gap-4">
              <button
                onClick={runComparison}
                disabled={!canRun || liveState === 'loading'}
                className="px-7 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5"
                style={canRun
                  ? { background: '#0A5CF5', color: '#fff' }
                  : { background: '#111', color: '#333', cursor: 'not-allowed' }
                }
                onMouseEnter={e => { if (canRun) e.currentTarget.style.background = '#0850d8' }}
                onMouseLeave={e => { if (canRun) e.currentTarget.style.background = '#0A5CF5' }}>
                <span>Run Comparison</span>
                <span style={{ opacity: 0.7 }}>→</span>
              </button>
              <span className="text-xs" style={{ color: '#333' }}>
                {inputs.filter(i => i.trim()).length} input{inputs.filter(i => i.trim()).length !== 1 ? 's' : ''} · LLM judge scores each pair
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {liveState === 'loading' && <LoadingPulse />}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {liveState === 'done' && (
          <motion.div key="results" ref={resultsRef}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#444' }}>Live Run · Demo Simulation</div>
                <h2 className="text-lg font-bold text-white">Comparison Results</h2>
              </div>
              <button
                onClick={() => { setLiveState('idle') }}
                className="text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all"
                style={{ border: '1px solid #1a1a1a', color: '#555' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#555' }}>
                ← Edit Prompts
              </button>
            </div>
            <ResultsList
              results={MOCK_LIVE_RESULTS}
              baselineLabel="Baseline — Concise"
              challengerLabel="Challenger — Detailed"
            />
            <div className="mt-8 rounded-xl p-5 flex items-center gap-5 flex-wrap"
              style={{ background: 'rgba(10,92,245,0.05)', border: '1px solid rgba(10,92,245,0.12)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white mb-1">Like what you see?</div>
                <div className="text-xs" style={{ color: '#555' }}>Sign up to run real comparisons against your actual agent — with your own LLM judge, CI integration, and full history.</div>
              </div>
              <Link href="/signup">
                <button className="px-5 py-2 rounded-lg text-sm font-semibold transition-all shrink-0"
                  style={{ background: '#fff', color: '#000' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                  Get Started Free →
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'sample' | 'live'>('sample')

  return (
    <div className="min-h-screen antialiased" style={{ background: '#080808', color: '#e8e8e8' }}>

      {/* Demo banner */}
      <div className="w-full py-2.5 px-4 text-center text-xs font-medium flex items-center justify-center gap-3"
        style={{ background: 'rgba(10,92,245,0.12)', borderBottom: '1px solid rgba(10,92,245,0.2)', color: '#60a5fa' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        This is a demo — Sign up free to use with your real agent data →
        <Link href="/signup" className="underline underline-offset-4 font-semibold text-white hover:text-blue-300 transition-colors">
          Create free account →
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-6 h-14 flex items-center justify-between" style={{ borderBottom: '1px solid #111' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center font-black text-[10px] text-black">WT</div>
          <span className="text-sm font-semibold text-white">Windtunnel</span>
          <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: 'rgba(10,92,245,0.15)', color: '#60a5fa', border: '1px solid rgba(10,92,245,0.25)' }}>Demo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all"
              style={{ border: '1px solid #1a1a1a', color: '#888' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#888' }}>
              Sign In
            </button>
          </Link>
          <Link href="/signup">
            <button className="text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
              style={{ background: '#fff', color: '#000' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
              Get Started Free
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="mb-10">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#444' }}>Windtunnel · Interactive Demo</div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-3">
            A/B test your AI agent prompts<br />
            <span style={{ color: '#0A5CF5' }}>before you ship them.</span>
          </h1>
          <p className="text-sm max-w-xl" style={{ color: '#555', lineHeight: '1.7' }}>
            Windtunnel runs your baseline and challenger prompts against the same test inputs, then uses an LLM judge to score each response pair. If your challenger regresses, it gets blocked.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease }}
          className="flex items-center gap-1 p-1 rounded-xl mb-8 w-fit"
          style={{ background: '#0a0a0a', border: '1px solid #111' }}>
          {(['sample', 'live'] as const).map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-5 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ color: activeTab === tab ? '#fff' : '#444' }}>
              {activeTab === tab && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-lg"
                  style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                  transition={{ duration: 0.2, ease }} />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab === 'sample' ? (
                  <>
                    <span style={{ opacity: 0.6 }}>◈</span> Sample Results
                  </>
                ) : (
                  <>
                    <span style={{ color: activeTab === 'live' ? '#0A5CF5' : '#444' }}>▶</span> Try It Live
                    {activeTab !== 'live' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(10,92,245,0.15)', color: '#60a5fa' }}>NEW</span>
                    )}
                  </>
                )}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'sample' ? (
            <motion.div key="sample"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease }}>
              {/* Sample run header */}
              <div className="flex items-start justify-between mb-2 flex-wrap gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#444' }}>Run · Sample Data</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>BLOCKED</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Support Bot — Prompt v2 vs v3</h2>
                  <p className="text-sm mt-1" style={{ color: '#555' }}>Ran {DEMO_RESULTS.length} production interactions · Completed just now</p>
                </div>
              </div>
              <ResultsList results={DEMO_RESULTS} baselineLabel="Baseline (v2)" challengerLabel="Challenger (v3)" />
            </motion.div>
          ) : (
            <motion.div key="live"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease }}>
              <TryItLive />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6, ease }}
          className="mt-16 rounded-2xl p-8 text-center" style={{ background: '#0a0a0a', border: '1px solid #111' }}>
          <h2 className="text-xl font-bold text-white mb-2">Ready to protect your own agent?</h2>
          <p className="text-sm mb-6" style={{ color: '#555' }}>Create a free account and connect your first project in under 2 minutes.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup">
              <button className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#fff', color: '#000' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                Create Free Account →
              </button>
            </Link>
            <Link href="/">
              <button className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ border: '1px solid #1a1a1a', color: '#666' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#666' }}>
                Learn More
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
