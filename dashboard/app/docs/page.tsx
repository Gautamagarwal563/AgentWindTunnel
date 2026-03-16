'use client'

import { useState } from 'react'
import Link from 'next/link'

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-white/[0.06] text-white' : 'text-[#666] hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function Code({ children, lang }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <pre className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 font-mono text-sm text-[#aaa] overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="absolute top-3 right-3 text-[10px] text-[#444] hover:text-[#888] transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-8">
      <h2 className="text-xl font-semibold mb-6 text-white">{title}</h2>
      {children}
    </section>
  )
}

const navLinks = [
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'record', label: 'Record Interactions' },
  { id: 'check', label: 'Run a Check' },
  { id: 'cicd', label: 'CI/CD Integration' },
  { id: 'sdk', label: 'Python SDK Reference' },
  { id: 'cli', label: 'CLI Reference' },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart')

  return (
    <div className="bg-black text-white min-h-screen">
      {/* App Sidebar */}
      <aside className="w-52 border-r border-[#1a1a1a] h-screen fixed left-0 top-0 flex flex-col">
        <div className="px-4 py-5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black text-xs font-bold">
              WT
            </div>
            <span className="text-sm font-semibold tracking-tight">Windtunnel</span>
          </div>
        </div>
        <nav className="flex-1 px-2 flex flex-col gap-0.5">
          <NavItem icon="◈" label="Runs" href="/dashboard" />
          <NavItem icon="◎" label="Interactions" href="/interactions" />
          <NavItem icon="⬡" label="API Keys" href="/api-keys" />
          <NavItem icon="◻" label="Docs" href="/docs" active />
        </nav>
        <div className="px-4 pb-5">
          <span className="text-[10px] text-[#333] font-mono">beta</span>
        </div>
      </aside>

      {/* Docs layout */}
      <div className="ml-52 flex">
        {/* Docs nav */}
        <nav className="w-48 border-r border-[#111] h-screen sticky top-0 pt-10 px-4 flex flex-col gap-1 shrink-0">
          <div className="text-[10px] text-[#333] uppercase tracking-widest mb-3 font-medium">On this page</div>
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setActiveSection(link.id)}
              className={`text-sm py-1.5 px-2 rounded transition-colors ${
                activeSection === link.id ? 'text-white bg-[#111]' : 'text-[#555] hover:text-[#aaa]'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-2xl px-10 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Documentation</h1>
            <p className="text-[#555] text-sm">Everything you need to start catching prompt regressions.</p>
          </div>

          <Section id="quickstart" title="Quick Start">
            <p className="text-[#666] text-sm mb-4">Install the SDK and set your API keys. You&apos;ll be running checks in under 2 minutes.</p>
            <Code>{`pip install windtunnel

export WINDTUNNEL_API_KEY=wt_your_key_here
export ANTHROPIC_API_KEY=sk-ant-...`}</Code>
            <div className="mt-4 p-4 bg-[#080808] border border-[#1a1a1a] rounded-xl">
              <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">Get your API key</div>
              <p className="text-sm text-[#666]">Find your API key in the <Link href="/api-keys" className="text-white underline underline-offset-4 decoration-[#333]">API Keys</Link> section of the dashboard.</p>
            </div>
          </Section>

          <Section id="record" title="Record Interactions">
            <p className="text-[#666] text-sm mb-4">Wrap your agent to automatically record every interaction to Windtunnel.</p>
            <Code>{`from windtunnel import WindTunnel

wt = WindTunnel(api_key="wt_your_key")

# In your agent handler:
response = your_agent.run(user_message)

wt.record(
    user_input=user_message,
    agent_output=response,
    prompt_version="v1",      # track your prompt version
    model="claude-haiku-4-5",  # optional
)`}</Code>
            <p className="text-[#555] text-xs mt-3">Recorded interactions become the test suite for future checks. The more you record, the better your coverage.</p>
          </Section>

          <Section id="check" title="Run a Check">
            <p className="text-[#666] text-sm mb-4">Compare your baseline prompt against a challenger. Windtunnel replays your recorded interactions through both and scores the results.</p>
            <Code>{`windtunnel check \\
  --baseline @prompts/v1.txt \\
  --challenger @prompts/v2.txt \\
  --n 20 \\
  --fail-on-regression`}</Code>
            <div className="mt-4 space-y-3">
              <div className="font-mono text-xs bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 text-[#aaa]">
                <div className="text-[#555]">🌪️  Windtunnel check starting...</div>
                <div className="text-[#555]">   Fetching 20 production interactions...</div>
                <div className="text-[#555]">   Testing interaction 1/20...</div>
                <div className="text-[#555]">   ...</div>
                <div className="text-[#22c55e] mt-2">✅ DEPLOY APPROVED — 5% regression rate (1/20 worse)</div>
                <div className="text-[#555]">   Run ID: run_abc123</div>
              </div>
              <div className="font-mono text-xs bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 text-[#aaa]">
                <div className="text-[#ef4444]">🚫 DEPLOY BLOCKED — 60% regression rate (12/20 worse)</div>
                <div className="text-[#555]">   Run ID: run_xyz789</div>
                <div className="text-[#555]">   Exit code: 1</div>
              </div>
            </div>
          </Section>

          <Section id="cicd" title="CI/CD Integration">
            <p className="text-[#666] text-sm mb-4">Add a Windtunnel check to your GitHub Actions workflow to block deploys automatically.</p>
            <Code>{`# .github/workflows/windtunnel.yml
name: Windtunnel Check

on:
  pull_request:
    paths:
      - 'prompts/**'

jobs:
  windtunnel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Windtunnel
        run: pip install windtunnel

      - name: Run regression check
        run: |
          windtunnel check \\
            --baseline @prompts/baseline.txt \\
            --challenger @prompts/challenger.txt \\
            --n 20 \\
            --fail-on-regression
        env:
          WINDTUNNEL_API_KEY: \${{ secrets.WINDTUNNEL_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}`}</Code>
            <p className="text-[#555] text-xs mt-3">The check exits with code 1 if the regression rate exceeds 30%, which fails the PR check automatically.</p>
          </Section>

          <Section id="sdk" title="Python SDK Reference">
            <div className="space-y-6">
              <div>
                <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">WindTunnel(api_key)</div>
                <Code>{`wt = WindTunnel(
    api_key: str,                   # required — your wt_* key
    anthropic_api_key: str = None,  # falls back to ANTHROPIC_API_KEY env
    supabase_url: str = None,       # optional override
    supabase_key: str = None        # optional override
)`}</Code>
              </div>
              <div>
                <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">wt.record(...)</div>
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
                <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">wt.run_windtunnel(...)</div>
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
            <div className="space-y-6">
              <div>
                <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">windtunnel check</div>
                <Code>{`windtunnel check [OPTIONS]

Options:
  --api-key TEXT        Windtunnel API key  [env: WINDTUNNEL_API_KEY]
  --anthropic-key TEXT  Anthropic API key   [env: ANTHROPIC_API_KEY]
  --baseline TEXT       Baseline prompt or @file.txt  [required]
  --challenger TEXT     Challenger prompt or @file.txt  [required]
  --n INTEGER           Number of interactions to test  [default: 10]
  --fail-on-regression  Exit code 1 if verdict is BLOCKED  [default: true]`}</Code>
              </div>
              <div>
                <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">windtunnel status</div>
                <Code>{`windtunnel status [OPTIONS]

Options:
  --api-key TEXT  Windtunnel API key  [env: WINDTUNNEL_API_KEY]

Verifies connection and prints your project ID.`}</Code>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}
