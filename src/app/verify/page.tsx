'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'

type ProjectKey = 'finance' | 'curalog'

const PROJECTS: Record<ProjectKey, {
  name: string
  tagline: string
  accent: string
  accentDark: string
  accentLight: string
  logoMark: React.ReactNode
  features: { icon: string; label: string }[]
}> = {
  finance: {
    name: 'Finance Tracker',
    tagline: 'Smart shared expense management',
    accent: '#4F46E5',
    accentDark: '#3730A3',
    accentLight: '#EEF2FF',
    logoMark: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="14" width="4" height="8" rx="1" fill="rgba(255,255,255,0.5)"/>
        <rect x="8" y="9" width="4" height="13" rx="1" fill="rgba(255,255,255,0.75)"/>
        <rect x="14" y="4" width="4" height="18" rx="1" fill="white"/>
        <polyline points="3,13 9,8 15,3 21,6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="21" cy="6" r="1.5" fill="white"/>
      </svg>
    ),
    features: [
      { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z', label: 'Track shared expenses' },
      { icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', label: 'Auto-split bills' },
      { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Send invoice emails' },
      { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Balance reports' },
    ],
  },
  curalog: {
    name: 'CuraLog',
    tagline: 'Care coordination, simplified',
    accent: '#0E4F54',
    accentDark: '#0a3538',
    accentLight: '#E6F4F5',
    logoMark: (
      <svg width="24" height="24" viewBox="0 0 16 16">
        <path d="M8 2v4M8 10v4M2 8h4M10 8h4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ),
    features: [
      { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Client management' },
      { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: 'Care plans & notes' },
      { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Scheduling & visits' },
      { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure & compliant' },
    ],
  },
}

function detectProject(next: string): ProjectKey {
  if (next.startsWith('/finance')) return 'finance'
  return 'curalog'
}

function VerifyContent() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/owner'

  const projectKey = detectProject(next)
  const project = PROJECTS[projectKey]

  const [step, setStep] = useState<'loading' | 'otp' | 'passkey' | 'failed'>('loading')
  const [hint, setHint] = useState('')
  const [channel, setChannel] = useState<'sms' | 'email'>('email')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [skipping, setSkipping] = useState(false)

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function init() {
    try {
      const check = await fetch('/api/auth/send-otp')
      if (!check.ok) { setStep('failed'); return }
      const { hasPasskeys } = await check.json()
      if (hasPasskeys) {
        setStep('passkey')
        startPasskeyLogin()
      } else {
        await sendOTP()
      }
    } catch {
      setStep('failed')
    }
  }

  async function sendOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectKey }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send code.')
        setStep('failed')
        return
      }
      setChannel(data.channel)
      setHint(data.hint)
      setStep('otp')
      setResendCooldown(30)
    } catch {
      setStep('failed')
    } finally {
      setLoading(false)
    }
  }

  async function startPasskeyLogin() {
    setLoading(true); setError('')
    try {
      const optRes = await fetch('/api/auth/passkey/login-options', { method: 'POST' })
      if (!optRes.ok) throw new Error('Failed to get passkey options')
      const options = await optRes.json()
      const authResponse = await startAuthentication({ optionsJSON: options })
      const verRes = await fetch('/api/auth/passkey/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResponse),
      })
      const data = await verRes.json()
      if (!data.success) throw new Error(data.message || 'Passkey verification failed')
      router.replace(next)
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        await sendOTP()
      } else {
        setError(e.message || 'Passkey failed.')
        await sendOTP()
      }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.message || 'Incorrect code.'); return }
      router.replace(next)
    } finally {
      setLoading(false)
    }
  }

  async function skipVerification() {
    setSkipping(true)
    try {
      const res = await fetch('/api/auth/skip-2fa', { method: 'POST' })
      if (res.ok) {
        router.replace(next)
      } else {
        setError('Could not continue. Please try signing in again.')
        setSkipping(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setSkipping(false)
    }
  }

  const accent = project.accent
  const accentLight = project.accentLight

  return (
    <>
      <style>{`
        .verify-wrap {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
        }
        .verify-left {
          flex: 1;
          background: linear-gradient(145deg, ${accent} 0%, ${project.accentDark} 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 40px;
          color: white;
        }
        .verify-right {
          width: 440px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: white;
        }
        .verify-card {
          width: 100%;
          max-width: 360px;
        }
        .verify-logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .verify-logo-mark {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: ${accent};
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .verify-logo-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #111;
          letter-spacing: -.01em;
        }
        .verify-icon-box {
          width: 56px; height: 56px;
          border-radius: 14px;
          background: ${accentLight};
          border: 1px solid ${accent}33;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .verify-btn-primary {
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          background: ${accent};
          color: white;
          font-weight: 700;
          font-size: .9rem;
          border: none;
          cursor: pointer;
          transition: background .15s;
          display: flex; align-items: center; justify-content: center;
        }
        .verify-btn-primary:hover:not(:disabled) { background: ${project.accentDark}; }
        .verify-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .verify-btn-secondary {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          background: white;
          color: #374151;
          font-weight: 600;
          font-size: .875rem;
          border: 1.5px solid #E5E7EB;
          cursor: pointer;
          transition: border-color .15s;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 10px;
        }
        .verify-btn-secondary:hover { border-color: #9CA3AF; }
        .verify-btn-ghost {
          background: none; border: none; cursor: pointer;
          color: #6B7280; font-size: .8rem; padding: 4px 0;
        }
        .verify-btn-ghost:hover { color: #374151; }
        .verify-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }
        .verify-inp {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 1.4rem;
          letter-spacing: .2em;
          text-align: center;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          margin-top: 4px;
        }
        .verify-inp:focus { border-color: ${accent}; box-shadow: 0 0 0 3px ${accent}22; }
        .verify-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 16px; font-size: .8rem; color: #DC2626;
          display: flex; gap: 8px; align-items: center;
        }
        .left-feature {
          display: flex; align-items: center; gap: 12px;
          padding: 8px 0;
        }
        .left-feature-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 8px;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 768px) {
          .verify-left { display: none; }
          .verify-right { width: 100%; }
        }
      `}</style>

      <div className="verify-wrap">
        {/* Left panel */}
        <div className="verify-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {project.logoMark}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{project.name}</div>
              <div style={{ fontSize: '.75rem', opacity: .7 }}>by DataPrimeTech</div>
            </div>
          </div>

          <div style={{ marginBottom: 16, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', opacity: .6, textTransform: 'uppercase' }}>
            Security check
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.15, marginBottom: 12 }}>
            Verify your identity
          </h1>
          <p style={{ fontSize: '.9rem', opacity: .8, marginBottom: 40, lineHeight: 1.6 }}>
            We keep your account secure with two-factor verification every time you sign in.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {project.features.map((f, i) => (
              <div key={i} className="left-feature">
                <div className="left-feature-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <span style={{ fontSize: '.875rem', opacity: .9 }}>{f.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 48, fontSize: '.75rem', opacity: .55 }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>← DataPrimeTech</a>
          </div>
        </div>

        {/* Right panel */}
        <div className="verify-right">
          <div className="verify-card">
            <div className="verify-logo-wrap">
              <div className="verify-logo-mark">
                {project.logoMark}
              </div>
              <span className="verify-logo-name">{project.name}</span>
            </div>

            {step === 'loading' && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '.9rem', color: '#6B7280' }}>Preparing verification…</div>
              </div>
            )}

            {step === 'failed' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fef9c3', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Verification unavailable</h2>
                <p style={{ fontSize: '.85rem', color: '#6B7280', marginBottom: 24 }}>
                  {error || "We couldn't send a verification code right now."}
                </p>
                <button onClick={init} className="verify-btn-secondary">Try again</button>
                <button onClick={skipVerification} disabled={skipping} className="verify-btn-primary">
                  {skipping ? 'Continuing…' : 'Continue without verification'}
                </button>
                <p style={{ fontSize: '.72rem', color: '#9CA3AF', marginTop: 12 }}>
                  You can set up 2FA in Settings → Security anytime.
                </p>
              </div>
            )}

            {step === 'passkey' && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div className="verify-icon-box">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Verify with passkey</h2>
                <p style={{ fontSize: '.875rem', color: '#6B7280', marginBottom: 24 }}>Use your saved passkey to verify your identity.</p>
                {error && <div className="verify-error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10v.5"/></svg>
                  {error}
                </div>}
                <button onClick={startPasskeyLogin} disabled={loading} className="verify-btn-primary" style={{ marginBottom: 8 }}>
                  {loading ? 'Waiting for passkey…' : 'Use passkey'}
                </button>
                <button onClick={sendOTP} className="verify-btn-ghost" style={{ width: '100%', textAlign: 'center', fontSize: '.8rem' }}>
                  Use a verification code instead
                </button>
              </div>
            )}

            {step === 'otp' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div className="verify-icon-box">
                    {channel === 'sms' ? (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                    ) : (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
                      </svg>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>
                    {channel === 'sms' ? 'Check your texts' : 'Check your email'}
                  </h2>
                  <p style={{ fontSize: '.875rem', color: '#6B7280' }}>
                    We sent a 6-digit code to <strong>{hint}</strong>
                  </p>
                </div>

                {error && (
                  <div className="verify-error">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10v.5"/></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={verifyOTP}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Verification code
                    </label>
                    <input
                      className="verify-inp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      autoFocus
                      required
                    />
                  </div>
                  <button type="submit" className="verify-btn-primary" disabled={loading || code.length < 6}>
                    {loading ? 'Verifying…' : 'Verify'}
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <button onClick={sendOTP} disabled={resendCooldown > 0 || loading} className="verify-btn-ghost">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </>
            )}

            <p style={{ textAlign: 'center', fontSize: '.72rem', color: '#9CA3AF', marginTop: 28 }}>
              {project.name} · Built by <strong>DataPrimeTech</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>
}
