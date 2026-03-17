'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signOut } from '@/lib/supabase'

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

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group rounded-xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
      <pre className="p-4 font-mono text-sm leading-relaxed overflow-x-auto" style={{ background: '#060606', color: '#888' }}>
        <code>{children}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded transition-all opacity-0 group-hover:opacity-100"
        style={{ border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid #222', color: copied ? '#22c55e' : '#555', background: '#0a0a0a' }}
      >{copied ? 'copied ✓' : 'copy'}</button>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-6">
      <h2 className="text-xl font-semibold mb-5 tracking-tight text-white">{title}</h2>
      <div className="space-y-4 text-sm" style={{ color: '#666', lineHeight: '1.7' }}>{children}</div>
    </section>
  )
}

function MethodLabel({ children }: { children: string }) {
  return (
    <div className="font-mono text-xs px-2.5 py-1 rounded mb-3 inline-block"
      style={{ background: 'rgba(10,92,245,0.08)', border: '1px solid rgba(10,92,245,0.15)', color: '#60a5fa' }}>
      {children}
    </div>
  )
}

const navLinks = [
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'record', label: 'Record Interactions' },
  { id: 'check', label: 'Run a Check' },
  { id: 'cicd', label: 'CI/CD Integration' },
  { id: 'sdk', label: 'SDK Reference' },
  { id: 'cli', label: 'CLI Reference' },
]

export default function DocsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('quickstart')

  return (
    <div className="min-h-screen" style={{ background: '#080808', color: '#fff' }}>

      {/* App Sidebar */}
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
          <NavItem icon="⬡" label="API Keys" href="/api-keys" />
          <NavItem icon="◻" label="Docs" href="/docs" active />
        </nav>

        <div className="px-2 pb-5">
          <button
            onClick={async () => { await signOut(); router.push('/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{ color: '#444' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'transparent' }}
          >
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Docs layout */}
      <div style={{ marginLeft: 220 }} className="flex">

        {/* Docs side nav */}
        <nav className="w-48 h-screen sticky top-0 pt-10 px-4 flex flex-col gap-0.5 shrink-0 overflow-y-auto" style={{ borderRight: '1px solid #111' }}>
          <div className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#333' }}>On this page</div>
          {navLinks.map(link => (
            <a key={link.id} href={`#${link.id}`}
              onClick={() => setActiveSection(link.id)}
              className="text-sm py-1.5 px-2 rounded transition-colors"
              style={{ color: activeSection === link.id ? '#fff' : '#555', background: activeSection === link.id ? '#111' : 'transparent' }}
            >{link.label}</a>
          ))}
        </nav>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 px-10 py-10 max-w-2xl"
        >
          <div className="mb-12">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Documentation</h1>
            <p className="text-sm" style={{ color: '#555' }}>Everything you need to start catching prompt regressions.</p>
          </div>

          <Section id="quickstart" title="Quick Start">
            <p>Install the SDK and set your API keys. You&apos;ll be running checks in under 2 minutes.</p>
            <Code>{`pip install windtunnel-ai

export WINDTUNNEL_API_KEY=wt_your_key_here
export ANTHROPIC_API_KEY=sk-ant-...`}</Code>
            <div className="p-4 rounded-xl" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <div className="text-[10px] uppercase tracking-widest mb-1.5 font-semibold" style={{ color: '#444' }}>Get your API key</div>
              <p>Find your API key in the <Link href="/api-keys" className="text-white underline underline-offset-4 decoration-[#333] hover:decoration-white transition-colors">API Keys</Link> section of the dashboard.</p>
            </div>
          </Section>

          <Section id="record" title="Record Interactions">
            <p>Wrap your agent to automatically record every interaction to Windtunnel.</p>
            <Code>{`from windtunnel import WindTunnel

wt = WindTunnel(api_key="wt_your_key")

# In your agent handler:
response = your_agent.run(user_message)

wt.record(
    user_input=user_message,
    agent_output=response,
    prompt_version="v1",       # track your prompt version
    model="claude-haiku-4-5",  # optional
)`}</Code>
            <p style={{ color: '#555' }}>Recorded interactions become the test suite for future checks. The more you record, the better your coverage.</p>
          </Section>

          <Section id="check" title="Run a Check">
            <p>Compare your baseline prompt against a challenger. Windtunnel replays your recorded interactions through both and scores the results with an LLM judge.</p>
            <Code>{`windtunnel check \\
  --baseline @prompts/v1.txt \\
  --challenger @prompts/v2.txt \\
  --n 20 \\
  --fail-on-regression`}</Code>
            <div className="space-y-3">
              <div className="font-mono text-xs rounded-xl p-4" style={{ background: '#060606', border: '1px solid #1a1a1a' }}>
                <div style={{ color: '#555' }}>🌪️  Windtunnel check starting...</div>
                <div style={{ color: '#555' }}>   Fetching 20 production interactions...</div>
                <div style={{ color: '#555' }}>   Testing interaction 1/20...</div>
                <div className="mt-2" style={{ color: '#22c55e' }}>✅ DEPLOY APPROVED — 5% regression rate (1/20 worse)</div>
                <div style={{ color: '#555' }}>   Run ID: run_abc123</div>
              </div>
              <div className="font-mono text-xs rounded-xl p-4" style={{ background: '#060606', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ color: '#ef4444' }}>🚫 DEPLOY BLOCKED — 60% regression rate (12/20 worse)</div>
                <div style={{ color: '#555' }}>   Run ID: run_xyz789  ·  Exit code: 1</div>
              </div>
            </div>
          </Section>

          <Section id="cicd" title="CI/CD Integration">
            <p>Add Windtunnel to your GitHub Actions workflow to automatically block merges when prompt quality degrades. Copy <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: '#111', color: '#60a5fa' }}>windtunnel.yml</code> from the dashboard into <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: '#111', color: '#60a5fa' }}>.github/workflows/</code> in your repo, then add your API key as a repository secret.</p>
            <Code>{`# .github/workflows/windtunnel.yml
name: Windtunnel Check

on:
  pull_request:
    branches: [main]

jobs:
  windtunnel-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - run: pip install windtunnel-ai

      - name: Run Windtunnel check
        env:
          WINDTUNNEL_API_KEY: \${{ secrets.WINDTUNNEL_API_KEY }}
        run: |
          python - <<'EOF'
          import os, sys, json
          from pathlib import Path
          from windtunnel import WindTunnel

          wt = WindTunnel(api_key=os.environ["WINDTUNNEL_API_KEY"])

          # Reads prompts from env vars or falls back to files
          baseline  = os.environ.get("BASELINE_PROMPT")  or Path("prompts/baseline.txt").read_text()
          challenger = os.environ.get("CHALLENGER_PROMPT") or Path("prompts/challenger.txt").read_text()

          # Loads tests from windtunnel_tests.json or uses 3 example interactions
          if Path("windtunnel_tests.json").exists():
              interactions = json.loads(Path("windtunnel_tests.json").read_text())
          else:
              interactions = [
                  {"user_input": "What is 2+2?",
                   "baseline_output": "4", "challenger_output": "4"},
                  {"user_input": "What is the capital of France?",
                   "baseline_output": "Paris.", "challenger_output": "Paris is the capital of France."},
                  {"user_input": "Reverse a string in Python.",
                   "baseline_output": "Use s[::-1].", "challenger_output": "Use s[::-1] or reversed(s)."},
              ]

          result = wt.check(baseline_prompt=baseline, challenger_prompt=challenger,
                            interactions=interactions)

          print(f"Verdict: {result['verdict']}  |  Regression rate: {result['regression_rate']:.0%}")
          sys.exit(1 if result["verdict"] == "BLOCKED" else 0)
          EOF`}</Code>
            <div className="p-4 rounded-xl space-y-1.5" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#444' }}>Setup</div>
              <p>1. Download <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: '#111', color: '#60a5fa' }}>windtunnel.yml</code> from the dashboard and place it in <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: '#111', color: '#60a5fa' }}>.github/workflows/</code>.</p>
              <p>2. Add <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: '#111', color: '#60a5fa' }}>WINDTUNNEL_API_KEY</code> to your repo&apos;s <strong className="text-white font-medium">Settings → Secrets and variables → Actions</strong>.</p>
              <p>3. Optionally add <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: '#111', color: '#60a5fa' }}>windtunnel_tests.json</code> to your repo root with your test interactions.</p>
            </div>
            <p style={{ color: '#555' }}>Exits with code 1 if verdict is BLOCKED, failing the PR check and preventing the merge automatically.</p>
          </Section>

          <Section id="sdk" title="Python SDK Reference">
            <div className="space-y-8">
              <div>
                <MethodLabel>WindTunnel(api_key)</MethodLabel>
                <Code>{`wt = WindTunnel(
    api_key: str,                   # required — your wt_* key
    anthropic_api_key: str = None,  # falls back to ANTHROPIC_API_KEY env
    supabase_url: str = None,       # optional override
    supabase_key: str = None        # optional override
)`}</Code>
              </div>
              <div>
                <MethodLabel>wt.record(...)</MethodLabel>
                <Code>{`wt.record(
    user_input: str,           # required
    agent_output: str,         # required
    prompt_version: str = 'v1',
    model: str = 'claude-haiku-4-5',
    metadata: dict = {},
    session_id: str = None     # auto-generated if not provided
) -> dict`}</Code>
              </div>
              <div>
                <MethodLabel>wt.run_windtunnel(...)</MethodLabel>
                <Code>{`wt.run_windtunnel(
    baseline_prompt: str,          # required
    challenger_prompt: str,        # required
    n_interactions: int = 10,
    baseline_version: str = 'v1',
    challenger_version: str = 'v2',
    run_name: str = None
) -> {
    run_id: str,
    verdict: 'APPROVED' | 'BLOCKED' | 'NEUTRAL',
    total: int,
    better: int,
    worse: int,
    neutral: int,
    regression_rate: float    # 0.0 – 1.0
}`}</Code>
              </div>
            </div>
          </Section>

          <Section id="cli" title="CLI Reference">
            <div className="space-y-8">
              <div>
                <MethodLabel>windtunnel check</MethodLabel>
                <Code>{`windtunnel check [OPTIONS]

Options:
  --api-key TEXT        Windtunnel API key  [env: WINDTUNNEL_API_KEY]
  --anthropic-key TEXT  Anthropic API key   [env: ANTHROPIC_API_KEY]
  --baseline TEXT       Baseline prompt or @file.txt  [required]
  --challenger TEXT     Challenger prompt or @file.txt  [required]
  --n INTEGER           Interactions to test  [default: 10]
  --fail-on-regression  Exit 1 if verdict is BLOCKED`}</Code>
              </div>
              <div>
                <MethodLabel>windtunnel status</MethodLabel>
                <Code>{`windtunnel status [OPTIONS]

Options:
  --api-key TEXT  Windtunnel API key  [env: WINDTUNNEL_API_KEY]

Verifies your connection and prints your project ID.`}</Code>
              </div>
            </div>
          </Section>
        </motion.main>
      </div>
    </div>
  )
}
