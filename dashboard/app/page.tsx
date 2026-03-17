'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease, delay },
})

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease, delay },
})

export default function LandingPage() {
  return (
    <div className="min-h-screen antialiased" style={{ background: '#FAFAF8', color: '#0A0A0A' }}>

      {/* ─── NAVBAR ─────────────────────────────────────────────────── */}
      <nav
        style={{ background: 'rgba(250,250,248,0.85)', borderBottom: '1px solid #E8E8E4', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        className="fixed top-0 w-full z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center font-black text-[10px] text-white select-none">WT</div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: '#0A0A0A' }}>Windtunnel</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[['Docs', '/docs'], ['Dashboard', '/dashboard']].map(([label, href]) => (
              <Link key={label} href={href} className="text-sm font-medium transition-colors" style={{ color: '#6B6B6B' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B6B6B')}
              >{label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider"
              style={{ border: '1px solid #E8E8E4', color: '#9B9B9B' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Open Source
            </span>
            <Link href="/signup">
              <button className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
                style={{ background: '#0A0A0A', color: '#FAFAF8' }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#222' }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.background = '#0A0A0A' }}
              >Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 px-6">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        {/* Radial fade out at center */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(250,250,248,1) 40%, transparent 100%)' }} />

        <div className="relative max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
              style={{ border: '1px solid #E8E8E4', color: '#6B6B6B', background: 'rgba(255,255,255,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Introducing Agent Windtunnel
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 {...fadeUp(0.1)}
            className="text-center leading-[1.04] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: '#0A0A0A' }}
          >
            The deploy gate<br />
            <span style={{ color: '#0A5CF5' }}>for AI agents.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p {...fadeUp(0.2)}
            className="text-center max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ fontSize: '1.125rem', color: '#6B6B6B' }}
          >
            Catch prompt regressions before they reach users. Record production traffic, replay it against your new prompt, block bad deploys automatically.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
            <Link href="/signup">
              <button className="px-7 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#0A0A0A', color: '#FAFAF8', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)' }}
              >Start for Free →</button>
            </Link>
            <Link href="/demo">
              <button className="px-7 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={{ border: '1px solid #E8E8E4', color: '#6B6B6B', background: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.borderColor = '#C0C0BC' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6B6B6B'; e.currentTarget.style.borderColor = '#E8E8E4' }}
              ><span>▶</span> Try Demo</button>
            </Link>
          </motion.div>

          {/* Terminal card — floating with 3D perspective */}
          <motion.div
            initial={{ opacity: 0, y: 48, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease, delay: 0.4 }}
            className="animate-float mx-auto max-w-2xl"
            style={{ perspective: '1200px' }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(0,0,0,0.08)', background: '#0A0A0A', boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)' }}>
              {/* Window chrome */}
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#111', borderBottom: '1px solid #1F1F1F' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                <span className="ml-3 text-xs font-mono" style={{ color: '#555' }}>windtunnel check</span>
              </div>
              {/* Terminal content */}
              <div className="px-6 py-5 font-mono text-sm leading-7">
                <div style={{ color: '#4B4B4B' }}>$ windtunnel check --fail-on-regression</div>
                <div className="mt-3 space-y-1">
                  <div><span style={{ color: '#22c55e' }}>✓</span> <span style={{ color: '#555' }}>Fetching 20 production interactions...</span></div>
                  <div><span style={{ color: '#22c55e' }}>✓</span> <span style={{ color: '#555' }}>Testing challenger prompt v2...</span></div>
                  <div><span style={{ color: '#22c55e' }}>✓</span> <span style={{ color: '#555' }}>LLM judge scoring responses...</span></div>
                </div>
                <div className="mt-5 rounded-lg px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span style={{ color: '#ef4444' }}>🚫</span>
                  <span className="font-bold" style={{ color: '#fca5a5' }}>DEPLOY BLOCKED</span>
                  <span style={{ color: '#555' }} className="ml-auto text-xs">80% regression</span>
                </div>
                <div className="mt-2 pl-1 text-xs" style={{ color: '#3B3B3B' }}>
                  &nbsp;&nbsp;16/20 interactions regressed &nbsp;&nbsp;Exit: <span style={{ color: '#ef4444' }}>1</span>
                  <span className="cursor-blink ml-1" style={{ color: '#555' }}>█</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ───────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #E8E8E4', borderBottom: '1px solid #E8E8E4', background: '#F4F4F2' }} className="py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <span className="text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap" style={{ color: '#B0B0A8' }}>
            Trusted by teams building AI agents
          </span>
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {['Acme', 'Delphi', 'Cortex', 'Meridian', 'Helix'].map(name => (
              <span key={name} className="text-sm font-semibold" style={{ color: '#CFCFC8' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT PREVIEW ────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...inView()} className="text-center mb-12">
            <p className="text-sm font-semibold mb-3" style={{ color: '#0A5CF5' }}>PRODUCT PREVIEW</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#0A0A0A' }}>See every regression before it ships</h2>
          </motion.div>

          {/* ── Main dashboard mockup ── */}
          <motion.div {...inView(0.1)}
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #E8E8E4',
              boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
              transformOrigin: 'top center',
            }}
          >
            {/* Browser chrome */}
            <div style={{ background: '#E8E8E4', borderBottom: '1px solid #D4D4CE', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', flexShrink: 0 }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E', flexShrink: 0 }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840', flexShrink: 0 }} />
              <div style={{
                flex: 1, marginLeft: 12, background: '#F4F4F2', border: '1px solid #D4D4CE',
                borderRadius: 6, padding: '3px 12px', fontSize: 11, color: '#9B9B9B',
                fontFamily: 'ui-monospace, monospace', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#B0B0A8', flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                app.windtunnel-six.vercel.app/dashboard
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['←', '→', '↻'].map(s => (
                  <div key={s} style={{ width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#9B9B9B', background: '#EEEEE9' }}>{s}</div>
                ))}
              </div>
            </div>

            {/* Dashboard body */}
            <div style={{ background: '#080808', display: 'flex', minHeight: 420 }}>

              {/* Sidebar */}
              <div style={{ width: 200, background: '#0C0C0C', borderRight: '1px solid #1A1A1A', padding: '20px 0', flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ padding: '0 16px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1A1A1A', marginBottom: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#000', fontFamily: 'sans-serif' }}>WT</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'sans-serif' }}>Windtunnel</span>
                </div>
                {/* Nav items */}
                {[
                  { label: 'Runs', icon: '▶', active: true },
                  { label: 'Interactions', icon: '⚡', active: false },
                  { label: 'API Keys', icon: '🔑', active: false },
                  { label: 'Docs', icon: '📄', active: false },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px', margin: '1px 8px',
                    borderRadius: 7, cursor: 'default',
                    background: item.active ? 'rgba(10,92,245,0.15)' : 'transparent',
                    border: item.active ? '1px solid rgba(10,92,245,0.25)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: 11, opacity: item.active ? 1 : 0.4 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: item.active ? 600 : 400, color: item.active ? '#fff' : '#555', fontFamily: 'sans-serif' }}>{item.label}</span>
                    {item.active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#0A5CF5' }} />}
                  </div>
                ))}
                {/* Org badge at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 200, padding: '12px 16px', borderTop: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1A1A2E', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#0A5CF5', fontWeight: 700, fontFamily: 'sans-serif' }}>A</div>
                  <span style={{ fontSize: 11, color: '#555', fontFamily: 'sans-serif' }}>acme-corp</span>
                </div>
              </div>

              {/* Main content */}
              <div style={{ flex: 1, padding: '24px 28px', position: 'relative', overflowX: 'hidden' }}>

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'sans-serif' }}>Windtunnel Runs</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '2px 9px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                      <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, fontFamily: 'sans-serif' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #222', background: '#111', fontSize: 11, color: '#555', fontFamily: 'sans-serif' }}>Filter ▾</div>
                    <div style={{ padding: '5px 12px', borderRadius: 7, background: '#0A5CF5', fontSize: 11, color: '#fff', fontWeight: 600, fontFamily: 'sans-serif' }}>+ New Run</div>
                  </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Total Runs', value: '12', color: '#fff', bg: '#111', border: '#222' },
                    { label: 'Blocked', value: '3', color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
                    { label: 'Approved', value: '9', color: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' },
                    { label: 'Avg Regression', value: '18%', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
                  ].map(card => (
                    <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: '#555', fontFamily: 'sans-serif', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: card.color, fontFamily: 'sans-serif', lineHeight: 1 }}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div style={{ border: '1px solid #1A1A1A', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 140px 120px 100px', background: '#0F0F0F', borderBottom: '1px solid #1A1A1A', padding: '8px 16px', gap: 12 }}>
                    {['Status', 'Run Name', 'Regression', 'Date', 'Actions'].map(h => (
                      <span key={h} style={{ fontSize: 10, color: '#444', fontWeight: 600, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                    ))}
                  </div>
                  {/* Table rows */}
                  {[
                    {
                      status: 'BLOCKED', statusColor: '#ef4444', statusBg: 'rgba(239,68,68,0.1)', statusBorder: 'rgba(239,68,68,0.25)',
                      name: 'Support Bot v2 vs v3', regression: '47%', regressionColor: '#ef4444',
                      date: 'Mar 17, 2026', rowBorder: 'rgba(239,68,68,0.06)',
                    },
                    {
                      status: 'APPROVED', statusColor: '#22c55e', statusBg: 'rgba(34,197,94,0.1)', statusBorder: 'rgba(34,197,94,0.25)',
                      name: 'Onboarding Agent v1 vs v2', regression: '8%', regressionColor: '#22c55e',
                      date: 'Mar 16, 2026', rowBorder: 'transparent',
                    },
                    {
                      status: 'APPROVED', statusColor: '#f59e0b', statusBg: 'rgba(245,158,11,0.08)', statusBorder: 'rgba(245,158,11,0.25)',
                      name: 'FAQ Bot v3 vs v4', regression: '12%', regressionColor: '#f59e0b',
                      date: 'Mar 15, 2026', rowBorder: 'transparent',
                    },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '110px 1fr 140px 120px 100px',
                      padding: '12px 16px', gap: 12, alignItems: 'center',
                      borderBottom: i < 2 ? '1px solid #141414' : 'none',
                      background: i === 0 ? 'rgba(239,68,68,0.02)' : 'transparent',
                    }}>
                      <div>
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: '0.07em',
                          color: row.statusColor, background: row.statusBg,
                          border: `1px solid ${row.statusBorder}`,
                          borderRadius: 5, padding: '2.5px 7px',
                        }}>{row.status}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#ddd', fontFamily: 'sans-serif', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 99, background: '#1A1A1A', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: row.regression, background: row.regressionColor, borderRadius: 99, opacity: 0.7 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: row.regressionColor, fontFamily: 'sans-serif', minWidth: 32, textAlign: 'right' }}>{row.regression}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#444', fontFamily: 'sans-serif' }}>{row.date}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ fontSize: 10, color: '#0A5CF5', fontFamily: 'sans-serif', cursor: 'default', fontWeight: 500 }}>View →</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </motion.div>

          {/* ── Run detail mini-mockup ── */}
          <motion.div {...inView(0.2)} className="mt-6 grid md:grid-cols-2 gap-5">

            {/* BLOCKED verdict card */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E8E4', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>
              {/* Browser chrome */}
              <div style={{ background: '#E8E8E4', borderBottom: '1px solid #D4D4CE', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                <div style={{ flex: 1, marginLeft: 8, background: '#F4F4F2', border: '1px solid #D4D4CE', borderRadius: 4, padding: '2px 10px', fontSize: 10, color: '#B0B0A8', fontFamily: 'ui-monospace, monospace' }}>
                  app.windtunnel-six.vercel.app/runs/r_9xk2p
                </div>
              </div>
              {/* Content */}
              <div style={{ background: '#080808', padding: '20px 22px' }}>
                {/* Breadcrumb */}
                <div style={{ fontSize: 10, color: '#444', fontFamily: 'sans-serif', marginBottom: 14 }}>Runs / <span style={{ color: '#666' }}>Support Bot v2 vs v3</span></div>
                {/* BLOCKED banner */}
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🚫</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fca5a5', fontFamily: 'sans-serif', letterSpacing: '-0.01em' }}>DEPLOY BLOCKED</div>
                    <div style={{ fontSize: 11, color: '#7f4040', fontFamily: 'sans-serif', marginTop: 2 }}>47% regression exceeds 30% threshold</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444', fontFamily: 'sans-serif', lineHeight: 1 }}>47%</div>
                    <div style={{ fontSize: 9.5, color: '#555', fontFamily: 'sans-serif', marginTop: 2 }}>regression rate</div>
                  </div>
                </div>
                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Interactions', value: '20', color: '#fff' },
                    { label: 'Regressed', value: '9', color: '#ef4444' },
                    { label: 'Improved', value: '11', color: '#22c55e' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#111', border: '1px solid #1A1A1A', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'sans-serif', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 9.5, color: '#555', fontFamily: 'sans-serif', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* APPROVED verdict card */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E8E4', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>
              {/* Browser chrome */}
              <div style={{ background: '#E8E8E4', borderBottom: '1px solid #D4D4CE', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
                <div style={{ flex: 1, marginLeft: 8, background: '#F4F4F2', border: '1px solid #D4D4CE', borderRadius: 4, padding: '2px 10px', fontSize: 10, color: '#B0B0A8', fontFamily: 'ui-monospace, monospace' }}>
                  app.windtunnel-six.vercel.app/runs/r_7mn3q
                </div>
              </div>
              {/* Content */}
              <div style={{ background: '#080808', padding: '20px 22px' }}>
                <div style={{ fontSize: 10, color: '#444', fontFamily: 'sans-serif', marginBottom: 14 }}>Runs / <span style={{ color: '#666' }}>Onboarding Agent v1 vs v2</span></div>
                {/* APPROVED banner */}
                <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✅</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#86efac', fontFamily: 'sans-serif', letterSpacing: '-0.01em' }}>APPROVED TO DEPLOY</div>
                    <div style={{ fontSize: 11, color: '#3a6648', fontFamily: 'sans-serif', marginTop: 2 }}>8% regression is within 30% threshold</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e', fontFamily: 'sans-serif', lineHeight: 1 }}>8%</div>
                    <div style={{ fontSize: 9.5, color: '#555', fontFamily: 'sans-serif', marginTop: 2 }}>regression rate</div>
                  </div>
                </div>
                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Interactions', value: '20', color: '#fff' },
                    { label: 'Regressed', value: '2', color: '#f59e0b' },
                    { label: 'Improved', value: '18', color: '#22c55e' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#111', border: '1px solid #1A1A1A', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'sans-serif', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 9.5, color: '#555', fontFamily: 'sans-serif', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...inView()} className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#B0B0A8' }}>Before &amp; After</p>
            <h2 className="leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#0A0A0A' }}>
              Stop flying blind.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            <motion.div {...inView(0)} className="rounded-2xl p-7" style={{ border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.02)' }}>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}>✗</div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>The Old Way</span>
              </div>
              <ul className="space-y-3.5">
                {['Ship prompt change to production', 'Watch user satisfaction drop', 'Get flooded with support tickets', 'Roll back manually 3 hours later'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>✗</span>
                    <span className="text-sm" style={{ color: '#6B6B6B' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...inView(0.1)} className="rounded-2xl p-7" style={{ border: '1px solid rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.02)' }}>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#22c55e' }}>✓</div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>With Windtunnel</span>
              </div>
              <ul className="space-y-3.5">
                {['Run windtunnel check in CI', 'Replay 20 real user conversations', 'Deploy blocked automatically', 'Ship with confidence'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>✓</span>
                    <span className="text-sm" style={{ color: '#6B6B6B' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ borderTop: '1px solid #E8E8E4' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...inView()} className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#B0B0A8' }}>Integration</p>
            <h2 className="leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#0A0A0A' }}>
              Dead simple integration.
            </h2>
            <p className="mt-4 text-sm" style={{ color: '#9B9B9B' }}>Three steps from zero to protected deploys.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01', title: 'Record',
                desc: '2 lines of code captures every real user interaction your agent handles in production.',
                code: `wt.record(\n  user_input=q,\n  agent_output=r\n)`,
              },
              {
                step: '02', title: 'Test',
                desc: 'Replay production interactions through both old and new prompts simultaneously.',
                code: `result = wt.run_windtunnel(\n  baseline_prompt=v1,\n  challenger_prompt=v2\n)`,
              },
              {
                step: '03', title: 'Block',
                desc: 'LLM-as-judge compares responses. Fails CI if regression exceeds your threshold.',
                code: `- run: windtunnel check\n    --fail-on-regression`,
              },
            ].map((s, i) => (
              <motion.div key={s.step} {...inView(i * 0.1)}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{ background: '#FFFFFF', border: '1px solid #E8E8E4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } as Parameters<typeof motion.div>[0]['whileHover']}
              >
                <span className="text-xs font-black tracking-widest" style={{ color: '#CFCFC8' }}>{s.step}</span>
                <h3 className="text-lg font-bold mt-3 mb-2" style={{ color: '#0A0A0A' }}>{s.title}</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#9B9B9B' }}>{s.desc}</p>
                <pre className="rounded-lg p-3 font-mono text-xs leading-relaxed overflow-x-auto" style={{ background: '#0A0A0A', color: '#888', border: '1px solid #1F1F1F' }}>{s.code}</pre>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#F4F4F2', borderTop: '1px solid #E8E8E4', borderBottom: '1px solid #E8E8E4' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { value: '< 2 min', label: 'from commit to verdict' },
            { value: '30%', label: 'regression threshold' },
            { value: '0', label: 'lines of config needed' },
          ].map((stat, i) => (
            <motion.div key={stat.value} {...inView(i * 0.1)} className="flex flex-col items-center">
              <div className="font-black mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#0A0A0A' }}>{stat.value}</div>
              <div className="text-sm" style={{ color: '#9B9B9B' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CI/CD SNIPPET ──────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...inView()} className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#B0B0A8' }}>CI/CD</p>
            <h2 className="leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#0A0A0A' }}>
              Plug into GitHub Actions.
            </h2>
          </motion.div>
          <motion.div {...inView(0.1)} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E8E4', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#F4F4F2', borderBottom: '1px solid #E8E8E4' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              <span className="ml-2 text-xs font-mono" style={{ color: '#B0B0A8' }}>.github/workflows/windtunnel.yml</span>
            </div>
            <pre className="px-6 py-5 font-mono text-sm leading-7 overflow-x-auto" style={{ background: '#0A0A0A', color: '#666' }}>
{`name: Windtunnel Check

on:
  pull_request:
    paths: ['prompts/**']

jobs:
  windtunnel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install windtunnel-ai
      - run: windtunnel check \\
               --baseline @prompts/baseline.txt \\
               --challenger @prompts/challenger.txt \\
               --fail-on-regression
        env:
          WINDTUNNEL_API_KEY: \${{ secrets.WINDTUNNEL_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}`}
            </pre>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ borderTop: '1px solid #E8E8E4' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...inView()} className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#B0B0A8' }}>Pricing</p>
            <h2 className="leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#0A0A0A' }}>
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-sm" style={{ color: '#9B9B9B' }}>Start free. Scale as you grow. No surprises.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                desc: 'Self-host or use our cloud. Everything you need to get started.',
                features: ['500 interactions / month', '5 runs / month', 'CLI + SDK', 'Self-hosted dashboard', 'Community support'],
                cta: 'Get started free',
                highlight: false,
                badge: null,
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/month',
                desc: 'Cloud-hosted, no setup. For teams shipping AI agents to production.',
                features: ['10,000 interactions / month', 'Unlimited runs', 'GitHub Actions integration', 'Advanced analytics dashboard', 'Slack notifications', 'Email support'],
                cta: 'Start free trial',
                highlight: true,
                badge: 'Most Popular',
              },
              {
                name: 'Team',
                price: '$99',
                period: '/month',
                desc: 'For growing engineering orgs with multiple agents and projects.',
                features: ['Unlimited interactions', 'Unlimited runs', 'RBAC + audit logs', 'SSO / SAML', 'Custom thresholds per project', 'SLA + dedicated support'],
                cta: 'Talk to us',
                highlight: false,
                badge: null,
              },
            ].map((plan, i) => (
              <motion.div key={plan.name} {...inView(i * 0.1)}
                className="rounded-2xl p-7 flex flex-col relative"
                style={{
                  background: plan.highlight ? '#0A0A0A' : '#FFFFFF',
                  border: plan.highlight ? '1px solid #0A5CF5' : '1px solid #E8E8E4',
                  boxShadow: plan.highlight ? '0 8px 40px rgba(10,92,245,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: '#0A5CF5', color: '#fff' }}>{plan.badge}</div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2" style={{ color: plan.highlight ? '#9B9B9B' : '#6B6B6B' }}>{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-black tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: plan.highlight ? '#FFFFFF' : '#0A0A0A' }}>{plan.price}</span>
                    {plan.period && <span className="text-sm" style={{ color: plan.highlight ? '#555' : '#9B9B9B' }}>{plan.period}</span>}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: plan.highlight ? '#666' : '#9B9B9B' }}>{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: plan.highlight ? '#888' : '#6B6B6B' }}>
                      <span className="mt-0.5 shrink-0" style={{ color: plan.highlight ? '#0A5CF5' : '#22c55e' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <button className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: plan.highlight ? '#0A5CF5' : 'transparent',
                      color: plan.highlight ? '#fff' : '#0A0A0A',
                      border: plan.highlight ? 'none' : '1px solid #E8E8E4',
                    }}
                    onMouseEnter={e => {
                      if (plan.highlight) e.currentTarget.style.background = '#0848c4'
                      else { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0A0A0A' }
                    }}
                    onMouseLeave={e => {
                      if (plan.highlight) e.currentTarget.style.background = '#0A5CF5'
                      else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.borderColor = '#E8E8E4' }
                    }}
                  >{plan.cta}</button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 px-6" style={{ borderTop: '1px solid #E8E8E4' }}>
        <motion.div {...inView()} className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase mb-6"
            style={{ border: '1px solid #E8E8E4', color: '#B0B0A8' }}>
            Get started today
          </span>
          <h2 className="leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#0A0A0A' }}>
            Start catching regressions today.
          </h2>
          <p className="text-sm mb-10" style={{ color: '#9B9B9B' }}>
            Free to start. No credit card. Works with any LLM framework.
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-3.5 rounded-lg text-base font-semibold"
              style={{ background: '#0A5CF5', color: '#FFFFFF', boxShadow: '0 4px 20px rgba(10,92,245,0.35)' }}
            >
              Get Started Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="pb-10" style={{ borderTop: '1px solid #E8E8E4' }}>
        <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-black flex items-center justify-center font-black text-[9px] text-white">WT</div>
            <span className="text-xs" style={{ color: '#B0B0A8' }}>© 2025 Windtunnel. MIT License.</span>
          </div>
          <div className="flex items-center gap-6">
            {['GitHub', 'Docs', 'Dashboard'].map(link => (
              <a key={link} href={link === 'Docs' ? '/docs' : link === 'Dashboard' ? '/dashboard' : '#'}
                className="text-xs transition-colors" style={{ color: '#B0B0A8' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#B0B0A8')}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
