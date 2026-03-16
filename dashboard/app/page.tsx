import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen antialiased bg-black text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#1a1a1a] bg-black/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center font-black text-xs text-black select-none shrink-0">
              WT
            </div>
            <span className="text-sm font-bold tracking-tight">Windtunnel</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Product', 'Docs', 'Pricing'].map((label) => (
              <a key={label} href="#" className="text-sm text-[#555] hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-[10px] font-semibold border border-[#222] text-[#666] px-2.5 py-1 rounded-full tracking-wider">
              Open Source
            </span>
            <Link href="/dashboard">
              <button className="text-sm font-semibold bg-white text-black px-4 py-1.5 rounded-lg hover:bg-[#e5e5e5] transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#222] text-[#666] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
            Introducing Agent Windtunnel
          </div>

          <h1 className="font-black leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', letterSpacing: '-0.03em' }}>
            The deploy gate for
            <br />
            <span className="text-white">AI agents</span>
          </h1>

          <p className="text-lg text-[#555] leading-relaxed max-w-xl mx-auto mb-10">
            Catch prompt regressions before they reach users. Record production traffic,
            replay it against your new prompt, block bad deploys automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/dashboard">
              <button className="px-7 py-3 bg-white text-black font-semibold rounded-lg hover:bg-[#e5e5e5] transition-colors text-sm">
                Start for Free
              </button>
            </Link>
            <button className="px-7 py-3 border border-[#222] text-[#888] font-medium rounded-lg hover:border-[#333] hover:text-white transition-colors text-sm">
              View Demo →
            </button>
          </div>

          <div className="w-full h-px bg-[#111] mb-16 max-w-xl mx-auto" />

          {/* Terminal */}
          <div className="mx-auto max-w-2xl rounded-2xl overflow-hidden border border-[#1a1a1a] bg-[#080808] text-left shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#111] bg-[#0a0a0a]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs font-mono text-[#444]">windtunnel check</span>
            </div>
            <div className="p-6 font-mono text-sm leading-7">
              <div className="text-[#333]">$ windtunnel check --fail-on-regression</div>
              <div className="mt-3 space-y-1">
                <div><span className="text-[#22c55e]">✓</span> <span className="text-[#555]">Fetching 20 production interactions...</span></div>
                <div><span className="text-[#22c55e]">✓</span> <span className="text-[#555]">Testing challenger prompt v2...</span></div>
                <div><span className="text-[#22c55e]">✓</span> <span className="text-[#555]">LLM judge scoring responses...</span></div>
              </div>
              <div className="mt-5">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg w-full bg-[#ef4444]/[0.08] border border-[#ef4444]/20">
                  <span className="text-[#ef4444]">🚫</span>
                  <span className="font-bold text-[#fca5a5]">DEPLOY BLOCKED</span>
                </div>
                <div className="text-[#444] pl-1 pt-1">
                  &nbsp;&nbsp;16/20 interactions regressed (80%)<br />
                  &nbsp;&nbsp;Exit code: <span className="text-[#ef4444]">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-8 border-y border-[#111]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          <span className="text-[10px] font-semibold tracking-widest text-[#333] uppercase">Trusted by teams building AI agents at</span>
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {['Acme', 'Delphi', 'Cortex AI', 'Meridian', 'Helix Labs'].map((name) => (
              <span key={name} className="text-sm font-semibold text-[#2a2a2a]">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#444] mb-3">Before &amp; After</p>
            <h2 className="text-4xl font-black tracking-tight" style={{ letterSpacing: '-0.025em' }}>Stop flying blind</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="border border-[#ef4444]/15 bg-[#0a0a0a] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-sm text-[#ef4444]">✗</div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#ef4444]">The Old Way</span>
              </div>
              <ul className="space-y-3">
                {['Ship prompt change to production', 'Watch user satisfaction drop', 'Get flooded with support tickets', 'Roll back manually 3 hours later'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-xs text-[#ef4444]">✗</span>
                    <span className="text-sm text-[#555]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-[#22c55e]/15 bg-[#0a0a0a] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-sm text-[#22c55e]">✓</div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#22c55e]">With Windtunnel</span>
              </div>
              <ul className="space-y-3">
                {['Run windtunnel check in CI', 'Replay 20 real user conversations', 'Deploy blocked automatically', 'Ship with confidence'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-xs text-[#22c55e]">✓</span>
                    <span className="text-sm text-[#555]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 border-t border-[#111]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#444] mb-3">Integration</p>
            <h2 className="text-4xl font-black tracking-tight" style={{ letterSpacing: '-0.025em' }}>Dead simple integration</h2>
            <p className="mt-4 text-sm text-[#444]">Three steps from zero to protected deploys.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Record',
                desc: '2 lines of code captures every real user interaction your agent handles in production.',
                code: `wt.record(\n  user_input=q,\n  agent_output=r\n)`,
              },
              {
                step: '02',
                title: 'Test',
                desc: 'Replay production interactions through both old and new prompts simultaneously.',
                code: `result = wt.run_windtunnel(\n  baseline_prompt=v1,\n  challenger_prompt=v2\n)`,
              },
              {
                step: '03',
                title: 'Block',
                desc: 'LLM-as-judge compares responses. Fails CI if regression exceeds your threshold.',
                code: `- run: windtunnel check\n    --fail-on-regression`,
              },
            ].map((s) => (
              <div key={s.step} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-black tracking-widest text-[#222]">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-[#444] leading-relaxed mb-4">{s.desc}</p>
                <pre className="bg-black border border-[#111] rounded-lg p-3 font-mono text-xs text-[#555] overflow-x-auto">{s.code}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 border-y border-[#111] bg-[#050505]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { value: '< 2 min', label: 'test time', sub: 'from commit to verdict' },
            { value: '30%', label: 'regression threshold', sub: 'configurable per project' },
            { value: '0', label: 'lines of config needed', sub: 'works with any LLM framework' },
          ].map((stat) => (
            <div key={stat.value} className="flex flex-col items-center">
              <div className="text-6xl font-black mb-2 text-white" style={{ letterSpacing: '-0.03em' }}>{stat.value}</div>
              <div className="text-sm font-semibold text-[#888] mb-1">{stat.label}</div>
              <div className="text-xs text-[#333]">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-2xl mx-auto text-center border border-[#1a1a1a] rounded-2xl p-16 bg-[#080808]">
          <span className="text-[10px] font-semibold border border-[#222] text-[#444] px-2.5 py-1 rounded-full tracking-wider uppercase mb-6 inline-block">
            Get started today
          </span>
          <h2 className="text-5xl font-black tracking-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
            Start catching regressions today
          </h2>
          <p className="text-sm text-[#444] mb-10">Free to start. No credit card. Works with any LLM framework.</p>
          <Link href="/dashboard">
            <button className="px-10 py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-[#e5e5e5] transition-colors text-base">
              Get Started Free
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pb-10 border-t border-[#111]">
        <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center font-black text-[9px] text-black">WT</div>
            <span className="text-xs text-[#333]">© 2025 Windtunnel</span>
          </div>
          <div className="flex items-center gap-6">
            {['GitHub', 'Docs', 'Twitter'].map((link) => (
              <a key={link} href="#" className="text-xs text-[#333] hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
