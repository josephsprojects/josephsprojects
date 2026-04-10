'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the recovery token in the URL fragment
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/login?reset=success')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
          </div>
          <span className="auth-logo-name">CuraLog</span>
        </div>

        {!ready ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔗</div>
            <p style={{ color: 'var(--text2)', fontSize: '.875rem' }}>Validating your reset link…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Set new password</h1>
            <p style={{ fontSize: '.875rem', color: 'var(--text3)', marginBottom: 24 }}>Choose a strong password for your account.</p>
            <form onSubmit={handleReset}>
              <div className="form-grp">
                <label className="form-lbl">New password</label>
                <input className="form-inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
              </div>
              <div className="form-grp">
                <label className="form-lbl">Confirm password</label>
                <input className="form-inp" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" required />
              </div>
              {error && <div style={{ color: 'var(--red)', fontSize: '.8rem', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                {loading ? 'Updating…' : 'Set new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
