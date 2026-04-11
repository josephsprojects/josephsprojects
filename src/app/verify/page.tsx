'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'

function VerifyContent() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/owner'

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
      const res = await fetch('/api/auth/send-otp', { method: 'POST' })
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
        // User dismissed — fall back to OTP
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

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="18" height="18" viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span className="auth-logo-name">CuraLog</span>
        </div>

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '.9rem', color: 'var(--text3)' }}>Preparing verification…</div>
          </div>
        )}

        {step === 'failed' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fef9c3', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Verification unavailable</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text3)', marginBottom: 24 }}>
              {error || "We couldn't send a verification code right now."}
            </p>
            <button onClick={init} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
              Try again
            </button>
            <button onClick={skipVerification} disabled={skipping} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {skipping ? 'Continuing…' : 'Continue without verification'}
            </button>
            <p style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 12 }}>
              You can set up 2FA in Settings → Security anytime.
            </p>
          </div>
        )}

        {step === 'passkey' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--teal-light)', border: '1px solid rgba(14,79,84,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Verify with passkey</h2>
            <p style={{ fontSize: '.875rem', color: 'var(--text3)', marginBottom: 24 }}>Use your saved passkey to verify your identity.</p>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', color: 'var(--red)' }}>{error}</div>}
            <button onClick={startPasskeyLogin} disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              {loading ? 'Waiting for passkey…' : 'Use passkey'}
            </button>
            <button onClick={sendOTP} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8, fontSize: '.8rem' }}>
              Use a verification code instead
            </button>
          </div>
        )}

        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--teal-light)', border: '1px solid rgba(14,79,84,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                {channel === 'sms' ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                )}
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>
                {channel === 'sms' ? 'Check your texts' : 'Check your email'}
              </h2>
              <p style={{ fontSize: '.875rem', color: 'var(--text3)' }}>
                We sent a 6-digit code to <strong>{hint}</strong>
              </p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', color: 'var(--red)', display: 'flex', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10v.5"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={verifyOTP}>
              <div className="form-grp">
                <label className="form-lbl">Verification code</label>
                <input
                  className="form-inp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  style={{ fontSize: '1.4rem', letterSpacing: '.2em', textAlign: 'center' }}
                  autoFocus
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 4 }} disabled={loading || code.length < 6}>
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <button onClick={sendOTP} disabled={resendCooldown > 0 || loading} className="btn btn-ghost" style={{ fontSize: '.8rem', color: 'var(--text3)' }}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button onClick={skipVerification} disabled={skipping} className="btn btn-ghost" style={{ fontSize: '.78rem', color: 'var(--text3)' }}>
                {skipping ? '…' : 'Set up later'}
              </button>
            </div>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--text3)', marginTop: 28 }}>
          CuraLog · Built by <strong>DataPrimeTech</strong>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>
}
