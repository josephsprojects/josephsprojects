'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
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
    if (authErr) {
      setError('Incorrect email or password.'); setLoading(false); return
    }

    // Look up role — redirect based on role
    const { data: profile } = await supabase.from('users').select('role').eq('supabase_id', data.user.id).single()
    const role = profile?.role || 'patient'
    const next = params.get('next')

    if (next && !next.startsWith('/login')) {
      router.push(next); return
    }

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

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="18" height="18" viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
          </div>
          <span className="auth-logo-name">CuraLog</span>
        </div>

        {mode === 'login' ? (
          <>
            <h1 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:4}}>Sign in</h1>
            <p style={{fontSize:'.875rem',color:'var(--text3)',marginBottom:24}}>Access your platform dashboard</p>

            {error && (
              <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:'.8rem',color:'var(--red)',display:'flex',gap:8}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10v.5"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-grp">
                <label className="form-lbl">Email Address</label>
                <input className="form-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
              </div>
              <div className="form-grp" style={{marginBottom:8}}>
                <label className="form-lbl" style={{display:'flex',justifyContent:'space-between'}}>
                  Password
                  <button type="button" onClick={() => setMode('forgot')} style={{background:'none',border:'none',color:'var(--teal)',fontSize:'.75rem',fontWeight:600,cursor:'pointer'}}>Forgot password?</button>
                </label>
                <div style={{position:'relative'}}>
                  <input className="form-inp" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required style={{paddingRight:40}} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text3)',fontSize:'.75rem'}}>
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'11px',marginTop:16}} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:4}}>Reset password</h1>
            <p style={{fontSize:'.875rem',color:'var(--text3)',marginBottom:24}}>Enter your email and we'll send a reset link.</p>

            {resetSent ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{width:48,height:48,borderRadius:12,background:'var(--teal-light)',border:'1px solid var(--teal-border,rgba(14,79,84,.15))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                </div>
                <p style={{fontWeight:600,marginBottom:8}}>Check your email</p>
                <p style={{fontSize:'.875rem',color:'var(--text3)'}}>We sent a password reset link to <strong>{email}</strong></p>
                <button type="button" onClick={() => { setMode('login'); setResetSent(false); }} className="btn btn-secondary" style={{marginTop:20}}>Back to sign in</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                {error && <div style={{color:'var(--red)',fontSize:'.8rem',marginBottom:12}}>{error}</div>}
                <div className="form-grp">
                  <label className="form-lbl">Email Address</label>
                  <input className="form-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'11px'}} disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setMode('login')} className="btn btn-ghost" style={{width:'100%',justifyContent:'center',marginTop:8}}>Back to sign in</button>
              </form>
            )}
          </>
        )}

        <p style={{textAlign:'center',fontSize:'.82rem',color:'var(--text3)',marginTop:20}}>
          Don't have an account?{' '}
          <a href="/signup" style={{color:'var(--teal)',fontWeight:600}}>Create one</a>
        </p>
        <p style={{textAlign:'center',fontSize:'.72rem',color:'var(--text3)',marginTop:12}}>
          CuraLog · Built by <strong>DataPrimeTech</strong>
        </p>
      </div>
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
