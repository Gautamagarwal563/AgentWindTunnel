import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080B14', color: 'white' }}>

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(8,11,20,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white select-none"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                boxShadow: '0 0 20px rgba(147,51,234,0.35)',
              }}
            >
              WT
            </div>
            <span className="text-base font-bold tracking-tight text-white">Agent Windtunnel</span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-150"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-150"
            >
              GitHub
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10"
              style={{ lineHeight: 1 }}
            >
              Dashboard
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="mt-px">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ paddingTop: '128px', paddingBottom: '96px' }}>
        {/* Background glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(147,51,234,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              border: '1px solid rgba(147,51,234,0.4)',
              background: 'rgba(147,51,234,0.08)',
              color: 'rgba(216,180,254,1)',
            }}
          >
            <span>🌪️</span>
            <span>Now in beta</span>
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight leading-none mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', letterSpacing: '-0.03em' }}
          >
            Stop shipping{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              bad
            </span>{' '}
            prompts
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: 'rgba(156,163,175,1)', fontSize: '1.125rem' }}
          >
            Agent Windtunnel automatically tests your new AI prompts against real production traffic
            before they go live. No more finding out your chatbot broke in production.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 0 30px rgba(124,58,237,0.35)',
              }}
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150"
              style={{ color: 'rgba(167,139,250,1)' }}
            >
              View Live Demo
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Stat bar */}
          <div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(107,114,128,1)',
            }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              <span style={{ color: 'rgba(156,163,175,1)' }}>Already protecting <strong className="text-white">3 AI agents</strong></span>
            </span>
            <span style={{ color: 'rgba(55,65,81,1)' }}>·</span>
            <span style={{ color: 'rgba(156,163,175,1)' }}><strong className="text-white">47 regressions</strong> caught</span>
            <span style={{ color: 'rgba(55,65,81,1)' }}>·</span>
            <span style={{ color: 'rgba(156,163,175,1)' }}><strong className="text-white">100%</strong> automated</span>
          </div>
        </div>
      </section>

      {/* ── CODE DEMO ── */}
      <section className="py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(147,51,234,0.05) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(147,51,234,1)' }}>The Problem vs The Solution</p>
            <h2 className="text-4xl font-black tracking-tight">See the difference in action</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Left — OLD WAY */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(13,17,23,1)',
                boxShadow: '0 0 40px rgba(239,68,68,0.06), inset 0 0 60px rgba(239,68,68,0.02)',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  borderBottom: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444', opacity: 0.7 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b', opacity: 0.7 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e', opacity: 0.3 }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'rgba(248,113,113,1)' }}>OLD WAY 😰</span>
                <div className="w-16" />
              </div>

              {/* Terminal content */}
              <div
                className="p-6 font-mono text-sm leading-7"
                style={{ color: 'rgba(209,213,219,1)' }}
              >
                <div>
                  <span style={{ color: 'rgba(107,114,128,1)' }}>$ </span>
                  <span>git push origin main</span>
                </div>
                <div style={{ color: 'rgba(34,197,94,1)' }}>✓ Deployed to production</div>
                <div className="mt-4" style={{ color: 'rgba(107,114,128,1)' }}>3 hours later...</div>
                <div className="mt-2" style={{ color: 'rgba(251,191,36,1)' }}>⚠️  User satisfaction dropped 40%</div>
                <div style={{ color: 'rgba(248,113,113,1)' }}>❌  Support tickets +300%</div>
                <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(252,165,165,1)' }}>
                  😱 &quot;Why is the chatbot so unhelpful now?&quot;
                </div>
              </div>
            </div>

            {/* Right — WITH WINDTUNNEL */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(34,197,94,0.2)',
                background: 'rgba(13,17,23,1)',
                boxShadow: '0 0 40px rgba(34,197,94,0.06), inset 0 0 60px rgba(34,197,94,0.02)',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: 'rgba(34,197,94,0.06)',
                  borderBottom: '1px solid rgba(34,197,94,0.15)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444', opacity: 0.7 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b', opacity: 0.7 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e', opacity: 0.7 }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'rgba(74,222,128,1)' }}>WITH WINDTUNNEL ✅</span>
                <div className="w-16" />
              </div>

              {/* Code content */}
              <div className="p-6 font-mono text-sm leading-7">
                <div>
                  <span style={{ color: 'rgba(196,181,253,1)' }}>result</span>
                  <span style={{ color: 'rgba(107,114,128,1)' }}> = </span>
                  <span style={{ color: 'rgba(147,197,253,1)' }}>wt</span>
                  <span style={{ color: 'rgba(209,213,219,1)' }}>.</span>
                  <span style={{ color: 'rgba(96,165,250,1)' }}>run_windtunnel</span>
                  <span style={{ color: 'rgba(209,213,219,1)' }}>(</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(209,213,219,1)' }}>    baseline_prompt</span>
                  <span style={{ color: 'rgba(107,114,128,1)' }}>=</span>
                  <span style={{ color: 'rgba(209,213,219,1)' }}>current,</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(209,213,219,1)' }}>    challenger_prompt</span>
                  <span style={{ color: 'rgba(107,114,128,1)' }}>=</span>
                  <span style={{ color: 'rgba(209,213,219,1)' }}>new_prompt</span>
                </div>
                <div style={{ color: 'rgba(209,213,219,1)' }}>)</div>

                <div className="mt-4" style={{ color: 'rgba(107,114,128,1)' }}># Output:</div>
                <div
                  className="mt-2 p-4 rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  <div className="font-black text-base mb-1" style={{ color: 'rgba(248,113,113,1)' }}>🚫 DEPLOY BLOCKED</div>
                  <div className="text-xs space-y-0.5" style={{ color: 'rgba(252,165,165,0.8)' }}>
                    <div>   4/5 interactions regressed</div>
                    <div>   Regression rate: <strong style={{ color: 'rgba(248,113,113,1)' }}>80%</strong></div>
                    <div style={{ color: 'rgba(74,222,128,1)' }}>   Deploy prevented automatically.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(147,51,234,1)' }}>How It Works</p>
            <h2 className="text-4xl font-black tracking-tight">Three steps to zero regressions</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                icon: '📡',
                title: 'Record',
                desc: '2 lines of code captures every real user interaction your agent handles in production, building your test library automatically.',
                accentColor: 'rgba(147,51,234,0.3)',
                borderColor: 'rgba(147,51,234,0.15)',
                glowColor: 'rgba(147,51,234,0.06)',
              },
              {
                num: '02',
                icon: '🧪',
                title: 'Test',
                desc: 'Before any prompt change ships, Windtunnel replays your last N production interactions through both the old and new versions simultaneously.',
                accentColor: 'rgba(59,130,246,0.3)',
                borderColor: 'rgba(59,130,246,0.15)',
                glowColor: 'rgba(59,130,246,0.06)',
              },
              {
                num: '03',
                icon: '🚫',
                title: 'Block',
                desc: 'LLM-as-judge compares responses. If the new prompt regresses on >30% of interactions, the deploy is blocked automatically — no human needed.',
                accentColor: 'rgba(239,68,68,0.3)',
                borderColor: 'rgba(239,68,68,0.15)',
                glowColor: 'rgba(239,68,68,0.06)',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl p-6 overflow-hidden group transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: `rgba(13,17,23,1)`,
                  border: `1px solid ${step.borderColor}`,
                  boxShadow: `0 0 40px ${step.glowColor}`,
                }}
              >
                {/* Big faded step number behind */}
                <div
                  className="absolute top-2 right-4 font-black select-none pointer-events-none"
                  style={{
                    fontSize: '7rem',
                    lineHeight: 1,
                    color: step.accentColor,
                    opacity: 0.18,
                  }}
                >
                  {step.num}
                </div>

                <div className="relative">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(107,114,128,1)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE SNIPPET / INTEGRATION ── */}
      <section className="py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(147,51,234,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-3xl mx-auto px-6 relative">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(147,51,234,1)' }}>Integration</p>
            <h2 className="text-4xl font-black tracking-tight">Up and running in 60 seconds</h2>
          </div>

          {/* Terminal window */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(147,51,234,0.08)',
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              </div>
              <span className="text-xs font-mono" style={{ color: 'rgba(107,114,128,1)' }}>quickstart.py</span>
              {/* Copy button */}
              <button
                className="text-xs px-3 py-1 rounded-md font-medium transition-all duration-150 hover:text-white"
                style={{
                  color: 'rgba(107,114,128,1)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                Copy
              </button>
            </div>

            {/* Code */}
            <div className="p-7 font-mono text-sm leading-8 overflow-x-auto">
              {/* pip install */}
              <div className="mb-5">
                <span style={{ color: 'rgba(107,114,128,1)' }}>$ </span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>pip install windtunnel</span>
              </div>

              <div>
                <span style={{ color: 'rgba(196,181,253,1)' }}>from</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}> windtunnel </span>
                <span style={{ color: 'rgba(196,181,253,1)' }}>import</span>
                <span style={{ color: 'rgba(147,197,253,1)' }}> WindTunnel</span>
              </div>
              <div>
                <span style={{ color: 'rgba(209,213,219,1)' }}>wt </span>
                <span style={{ color: 'rgba(107,114,128,1)' }}>= </span>
                <span style={{ color: 'rgba(96,165,250,1)' }}>WindTunnel</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>(api_key</span>
                <span style={{ color: 'rgba(107,114,128,1)' }}>=</span>
                <span style={{ color: 'rgba(134,239,172,1)' }}>&quot;wt_your_key&quot;</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>)</span>
              </div>
              <div>
                <span style={{ color: 'rgba(147,197,253,1)' }}>wt</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>.</span>
                <span style={{ color: 'rgba(96,165,250,1)' }}>record</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>(user_input</span>
                <span style={{ color: 'rgba(107,114,128,1)' }}>=</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>query, agent_output</span>
                <span style={{ color: 'rgba(107,114,128,1)' }}>=</span>
                <span style={{ color: 'rgba(209,213,219,1)' }}>response)</span>
              </div>

              <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'rgba(107,114,128,1)' }}># That&apos;s it. Windtunnel now protects every future deploy. 🌪️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-16 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(13,17,23,0.6)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              {
                value: '0',
                unit: 'prompt regressions',
                detail: 'reached production this month',
                color: 'rgba(74,222,128,1)',
                glow: 'rgba(34,197,94,0.15)',
              },
              {
                value: '100%',
                unit: 'of runs',
                detail: 'fully automated, no human review needed',
                color: 'rgba(167,139,250,1)',
                glow: 'rgba(147,51,234,0.15)',
              },
              {
                value: '< 2 min',
                unit: 'average test time',
                detail: 'from commit to verdict',
                color: 'rgba(96,165,250,1)',
                glow: 'rgba(59,130,246,0.15)',
              },
            ].map((stat) => (
              <div key={stat.value} className="flex flex-col items-center">
                <div
                  className="text-5xl font-black mb-2"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 30px ${stat.glow}`,
                  }}
                >
                  {stat.value}
                </div>
                <div className="font-semibold text-white mb-1">{stat.unit}</div>
                <div className="text-sm" style={{ color: 'rgba(75,85,99,1)' }}>{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-28 relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '400px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.05) 100%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          {/* Divider line with glow */}
          <div
            className="w-px h-16 mx-auto mb-10"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(147,51,234,0.6), transparent)',
            }}
          />

          <h2 className="text-5xl font-black tracking-tight mb-4 leading-tight">
            Ready to stop shipping
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              broken prompts?
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(107,114,128,1)' }}>
            Join the teams shipping AI with confidence. Free to start, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 0 40px rgba(124,58,237,0.4)',
              }}
            >
              Start Free Trial
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
              style={{
                color: 'rgba(209,213,219,1)',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-8"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs text-white"
              style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)' }}
            >
              WT
            </div>
            <span className="text-sm" style={{ color: 'rgba(75,85,99,1)' }}>
              © 2025 Agent Windtunnel
            </span>
            <span style={{ color: 'rgba(55,65,81,1)' }}>·</span>
            <span className="text-sm" style={{ color: 'rgba(75,85,99,1)' }}>Built for the LLM era</span>
          </div>

          {/* Footer links */}
          <div className="flex items-center gap-6">
            {['Docs', 'GitHub', 'Privacy', 'Terms'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors duration-150 hover:text-white"
                style={{ color: 'rgba(75,85,99,1)' }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
