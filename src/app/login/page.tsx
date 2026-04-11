'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Project configs ────────────────────────────────────────────────────────────
const PROJECTS = {
  finance: {
    name: 'Fintra',
    tagline: 'Your money, fully under control.',
    accent: '#4F6EF7',
    accentDark: '#3b55d4',
    accentBg: '#eff2ff',
    logoMark: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15"/>
        <rect x="7" y="24" width="5" height="9" rx="1.5" fill="white" fillOpacity="0.4"/>
        <rect x="14" y="18" width="5" height="15" rx="1.5" fill="white" fillOpacity="0.65"/>
        <rect x="21" y="12" width="5" height="21" rx="1.5" fill="white"/>
        <polyline points="9.5,26 16.5,20 23.5,14 31,8" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <polyline points="27,7 31,8 30,12" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    features: [
      { icon: 'M1 4h22v16H1zM1 8h22', label: 'Credit card tracking', desc: 'Monitor balances, limits & APR across all cards' },
      { icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', label: 'Debt payoff planner', desc: 'Avalanche & snowball simulations' },
      { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', label: 'Shared expense invoicing', desc: 'Split costs and send professional invoices' },
      { icon: 'M2 20h20M6 20V10M12 20V4M18 20v-8', label: 'Progress snapshots', desc: 'Track your net worth & utilization over time' },
    ],
  },
  curalog: {
    name: 'CuraLog',
    tagline: 'Care coordination that keeps everyone informed.',
    accent: '#0E4F54',
    accentDark: '#0a3a3f',
    accentBg: '#e8f4f5',
    logoMark: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" strokeLinecap="round">
        <rect x="9" y="2" width="6" height="4" rx="1"/>
        <path d="M8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2"/>
        <path d="M12 12v4M10 14h4"/>
      </svg>
    ),
    features: [
      { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', label: 'Multi-patient support', desc: 'Manage care for multiple people from one place' },
      { icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0', label: 'Refill management', desc: 'Track refills from prescriber to pharmacy to pickup' },
      { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Secure messaging', desc: 'In-app communication between care team members' },
      { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: '2FA secured', desc: 'OTP verification, role-based access, audit logs' },
    ],
  },
  default: {
    name: 'DataPrimeTech',
    tagline: 'Custom software built around how you actually work.',
    accent: '#1a1a2e',
    accentDark: '#0f0f1a',
    accentBg: '#f0f2f5',
    logoMark: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" strokeLinecap="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    features: [
      { icon: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4 12 14.01 9 11.01', label: 'Real workflows', desc: 'Software built around how you actually work' },
      { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Security first', desc: '2FA, role-based access, encrypted at rest' },
      { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Fast iteration', desc: 'New features ship without rearchitecting everything' },
      { icon: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z', label: 'Fully custom', desc: 'No templates, no shortcuts — built from scratch' },
    ],
  },
}

function detectProject(next: string | null): keyof typeof PROJECTS {
  if (!next) return 'default'
  if (next.startsWith('/finance')) return 'finance'
  if (next.startsWith('/curalog') || next.startsWith('/owner') || next.startsWith('/app') || next.startsWith('/portal') || next.startsWith('/verify')) return 'curalog'
  return 'default'
}

// ── Login form ─────────────────────────────────────────────────────────────────
function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next')
  const projectKey = detectProject(next)
  const project = PROJECTS[projectKey]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    if (params.get('error') === 'unauthorized') setError('You do not have permission to access that page.')
  }, [params])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (authErr) { setError('Incorrect email or password.'); setLoading(false); return }

    const { data: profile } = await supabase.from('users').select('role').eq('supabase_id', data.user.id).single()
    const role = profile?.role || 'patient'

    if (next && !next.startsWith('/login')) { router.push(next); return }
    switch (role) {
      case 'platform_owner': router.push('/owner'); break
      case 'workspace_owner': router.push('/app/dashboard'); break
      case 'manager': router.push('/app/dashboard'); break
      case 'patient': router.push('/app/patient'); break
      case 'provider': router.push('/app/provider'); break
      default: router.push('/app/dashboard')
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Enter your email address.'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError('Failed to send reset email. Try again.'); return }
    setResetSent(true)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: '.875rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Left panel ── */}
      <div style={{ width: '42%', minWidth: 360, background: project.accent, display: 'flex', flexDirection: 'column', padding: '40px 48px', position: 'relative', overflow: 'hidden' }}
        className="login-left">

        {/* Background decoration */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.04)', top: -120, right: -120, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.03)', bottom: -80, left: -80, pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {project.logoMark}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-.3px', lineHeight: 1.2 }}>{project.name}</div>
            <div style={{ color: 'rgba(255,255,255,.55)', fontSize: '.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>by DataPrimeTech</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>
            {projectKey === 'default' ? 'Welcome' : `Project ${projectKey === 'finance' ? '2' : '1'}`}
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.2, marginBottom: 14 }}>
            {project.tagline}
          </h1>
          <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 40, maxWidth: 320 }}>
            {projectKey === 'finance'
              ? 'Track every card, split every expense, and plan your way out of debt — all in one place.'
              : projectKey === 'curalog'
              ? 'From medications to messages to refills, CuraLog keeps caregivers and patients on the same page.'
              : 'Real software for real workflows. Sign in to access the DataPrimeTech platform.'}
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {project.features.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '.82rem', lineHeight: 1.3 }}>{f.label}</div>
                  <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.75rem', marginTop: 2, lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <div style={{ marginTop: 48, position: 'relative', zIndex: 1 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,.45)', fontSize: '.75rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.75)') }
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.45)') }>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            DataPrimeTech
          </a>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {mode === 'login' ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', letterSpacing: '-.5px', marginBottom: 6 }}>Sign in</h2>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>
                  {projectKey === 'finance' ? 'Access your Fintra dashboard'
                    : projectKey === 'curalog' ? 'Access your CuraLog dashboard'
                    : 'Access your DataPrimeTech account'}
                </p>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '.82rem', color: '#dc2626', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10v.5"/></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
                  <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email" required
                    onFocus={e => (e.target.style.borderColor = project.accent)}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Password
                    <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: project.accent, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inp, paddingRight: 44 }} type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password" autoComplete="current-password" required
                      onFocus={e => (e.target.style.borderColor = project.accent)}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: '100%', marginTop: 20, padding: '11px', background: project.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit', transition: 'background .15s' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = project.accentDark }}
                  onMouseLeave={e => { e.currentTarget.style.background = project.accent }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '.82rem', color: '#9ca3af', marginTop: 24 }}>
                Don&apos;t have an account?{' '}
                <a href="/signup" style={{ color: project.accent, fontWeight: 600, textDecoration: 'none' }}>Create one</a>
              </p>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', letterSpacing: '-.5px', marginBottom: 6 }}>Reset password</h2>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Enter your email and we&apos;ll send a reset link.</p>
              </div>

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: project.accentBg, border: `1px solid ${project.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={project.accent} strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: 6 }}>Check your email</p>
                  <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 24 }}>Reset link sent to <strong style={{ color: '#374151' }}>{email}</strong></p>
                  <button onClick={() => { setMode('login'); setResetSent(false) }}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  {error && <div style={{ color: '#dc2626', fontSize: '.82rem', marginBottom: 14 }}>{error}</div>}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
                    <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                      onFocus={e => (e.target.style.borderColor = project.accent)}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: '11px', background: project.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit' }}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                  <button type="button" onClick={() => setMode('login')}
                    style={{ width: '100%', marginTop: 8, padding: '11px', background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>
                    Back to sign in
                  </button>
                </form>
              )}
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '.72rem', color: '#d1d5db', marginTop: 40 }}>
            {project.name} · Built by <strong style={{ color: '#9ca3af' }}>DataPrimeTech</strong>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
