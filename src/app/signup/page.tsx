'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignupContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }

    // If session is immediately available (email confirmation disabled), go straight in
    if (data.session) {
      router.push('/verify?next=/owner')
      return
    }

    // Otherwise show "check your email" screen
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo" style={{ justifyContent: 'center' }}>
            <div className="auth-logo-mark">
              <svg width="18" height="18" viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span className="auth-logo-name">CuraLog</span>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Check your email</h2>
          <p style={{ fontSize: '.875rem', color: 'var(--text3)', marginBottom: 20 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            Back to sign in
          </Link>
        </div>
      </div>
    )
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

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Create account</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--text3)', marginBottom: 24 }}>
          Join CuraLog to manage medications and care coordination.
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '.8rem', color: 'var(--red)', display: 'flex', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10v.5"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-grp">
            <label className="form-lbl">Full name</label>
            <input className="form-inp" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" autoComplete="name" required />
          </div>
          <div className="form-grp">
            <label className="form-lbl">Email address</label>
            <input className="form-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="form-grp" style={{ marginBottom: 8 }}>
            <label className="form-lbl">Password <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— min. 8 characters</span></label>
            <div style={{ position: 'relative' }}>
              <input className="form-inp" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" autoComplete="new-password" required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', fontSize: '.75rem' }}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 16 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text3)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Sign in</Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--text3)', marginTop: 16 }}>
          CuraLog · Built by <strong>DataPrimeTech</strong>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense><SignupContent /></Suspense>
}
