'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { startRegistration } from '@simplewebauthn/browser'

type Tab = 'account' | 'security' | 'notifications'

interface NotifPrefs {
  refill_requests:     boolean
  low_supply:          boolean
  status_changes:      boolean
  new_messages:        boolean
  patient_added:       boolean
  medication_added:    boolean
  login_alerts:        boolean
  email_notifications: boolean
  sms_notifications:   boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  refill_requests:     true,
  low_supply:          true,
  status_changes:      true,
  new_messages:        true,
  patient_added:       true,
  medication_added:    false,
  login_alerts:        false,
  email_notifications: true,
  sms_notifications:   false,
}

const NOTIF_OPTIONS: { key: keyof NotifPrefs; label: string; desc: string; group: string }[] = [
  { key: 'refill_requests',     label: 'New refill requests',    desc: 'When a new refill request is submitted',          group: 'Activity' },
  { key: 'low_supply',          label: 'Low medication supply',  desc: 'When a medication has 7 or fewer days remaining', group: 'Activity' },
  { key: 'status_changes',      label: 'Refill status changes',  desc: 'When a refill moves through the pipeline',        group: 'Activity' },
  { key: 'new_messages',        label: 'New messages',           desc: 'When you receive an in-app message',              group: 'Activity' },
  { key: 'patient_added',       label: 'New patient added',      desc: 'When a patient is created in any workspace',      group: 'Activity' },
  { key: 'medication_added',    label: 'Medication added',       desc: 'When a new medication is added for any patient',  group: 'Activity' },
  { key: 'login_alerts',        label: 'Login alerts',           desc: 'When someone signs in to your account',           group: 'Security' },
  { key: 'email_notifications', label: 'Email notifications',    desc: 'Receive notifications via email',                 group: 'Delivery' },
  { key: 'sms_notifications',   label: 'SMS notifications',      desc: 'Receive notifications via text message',          group: 'Delivery' },
]

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem('curalog_notif_prefs')
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_PREFS }
}

interface User { id: string; name: string; email: string; phone?: string | null; role: string }

export default function SettingsClient({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>('account')

  // Account
  const [name, setName]   = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg]       = useState('')

  // Security — password
  const [newPw, setNewPw]   = useState('')
  const [conPw, setConPw]   = useState('')
  const [pwErr, setPwErr]   = useState('')
  const [pwMsg, setPwMsg]   = useState('')
  const [savingPw, setSavingPw] = useState(false)

  // Security — passkeys
  type PasskeyEntry = { id: string; name: string; created_at: string; last_used: string | null }
  const [passkeys, setPasskeys]       = useState<PasskeyEntry[]>([])
  const [pkLoading, setPkLoading]     = useState(false)
  const [pkMsg, setPkMsg]             = useState('')
  const [enrolling, setEnrolling]     = useState(false)
  const [newPkName, setNewPkName]     = useState('')
  const [showEnroll, setShowEnroll]   = useState(false)

  useEffect(() => {
    if (tab === 'security') loadPasskeys()
  }, [tab])

  async function loadPasskeys() {
    setPkLoading(true)
    const res = await fetch('/api/auth/passkey/list')
    const data = await res.json()
    setPkLoading(false)
    if (data.success) setPasskeys(data.data)
  }

  async function enrollPasskey(e: React.FormEvent) {
    e.preventDefault()
    setEnrolling(true); setPkMsg('')
    try {
      const optRes = await fetch('/api/auth/passkey/register-options', { method: 'POST' })
      if (!optRes.ok) throw new Error('Failed to get registration options')
      const options = await optRes.json()

      const reg = await startRegistration({ optionsJSON: options })

      const verRes = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reg, name: newPkName.trim() }),
      })
      const data = await verRes.json()
      if (!data.success) throw new Error(data.message || 'Registration failed')

      setPkMsg('Passkey added successfully.')
      setNewPkName(''); setShowEnroll(false)
      await loadPasskeys()
    } catch (e: any) {
      if (e.name !== 'NotAllowedError') setPkMsg(e.message || 'Failed to add passkey.')
    } finally {
      setEnrolling(false)
      setTimeout(() => setPkMsg(''), 4000)
    }
  }

  async function deletePasskey(id: string) {
    setPkMsg('')
    await fetch('/api/auth/passkey/list', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setPasskeys(prev => prev.filter(p => p.id !== id))
    setPkMsg('Passkey removed.')
    setTimeout(() => setPkMsg(''), 3000)
  }

  // Notifications
  const [prefs, setPrefs]         = useState<NotifPrefs>(loadPrefs)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [testSending, setTestSending] = useState<'sms' | 'email' | 'both' | null>(null)
  const [testResult, setTestResult]   = useState<{ ok: boolean; msg: string } | null>(null)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true); setProfileMsg('')
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
    })
    setSavingProfile(false)
    setProfileMsg(res.ok ? 'Profile saved.' : 'Failed to save.')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErr(''); setPwMsg('')
    if (newPw.length < 8) { setPwErr('Password must be at least 8 characters.'); return }
    if (newPw !== conPw)  { setPwErr('Passwords do not match.'); return }
    setSavingPw(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSavingPw(false)
    if (error) { setPwErr(error.message); return }
    setPwMsg('Password updated successfully.')
    setNewPw(''); setConPw('')
    await fetch('/api/audit/log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', entityType: 'account', entityName: 'Password', field: 'password', fromValue: '●●●●', toValue: '●●●●' }),
    })
  }

  function togglePref(key: keyof NotifPrefs) {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem('curalog_notif_prefs', JSON.stringify(next)) } catch {}
      return next
    })
    setPrefsSaved(false)
  }

  function savePrefs() {
    try { localStorage.setItem('curalog_notif_prefs', JSON.stringify(prefs)) } catch {}
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2500)
  }

  async function sendTest(channel: 'sms' | 'email' | 'both') {
    setTestSending(channel); setTestResult(null)
    const res = await fetch('/api/notifications/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    })
    const data = await res.json()
    setTestSending(null)
    setTestResult({ ok: data.success, msg: data.message || (data.success ? 'Sent!' : 'Failed') })
    setTimeout(() => setTestResult(null), 6000)
  }

  const TAB_STYLE = (t: Tab) => ({
    padding: '8px 16px', fontWeight: 600, fontSize: '.875rem', border: 'none', cursor: 'pointer',
    borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent',
    background: 'none', color: tab === t ? 'var(--teal)' : 'var(--text3)', transition: 'all .15s',
  })

  const groups = [...new Set(NOTIF_OPTIONS.map(o => o.group))]

  return (
    <div className="pg-inner">
      <div className="pg-hd"><h2>Settings</h2><p>Manage your account and preferences</p></div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button style={TAB_STYLE('account')}       onClick={() => setTab('account')}>Account</button>
        <button style={TAB_STYLE('security')}      onClick={() => setTab('security')}>Security</button>
        <button style={TAB_STYLE('notifications')} onClick={() => setTab('notifications')}>Notifications</button>
      </div>

      {/* ── Account ── */}
      {tab === 'account' && (
        <div style={{ maxWidth: 520 }}>
          <div className="crd" style={{ marginBottom: 20 }}>
            <div className="crd-h">Profile</div>
            <form onSubmit={saveProfile}>
              <div className="form-grp">
                <label className="form-lbl">Full name</label>
                <input className="form-inp" data-1p-ignore autoComplete="off" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-grp">
                <label className="form-lbl">Email</label>
                <input className="form-inp" value={user.email} disabled style={{ opacity: .6 }} />
                <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Email changes require a Supabase admin action.</span>
              </div>
              <div className="form-grp">
                <label className="form-lbl">
                  Phone number
                  <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 6 }}>— for SMS alerts and test messages</span>
                </label>
                <input className="form-inp" data-1p-ignore autoComplete="off" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 555-867-5309" />
              </div>
              <div className="form-grp">
                <label className="form-lbl">Role</label>
                <input className="form-inp" value={user.role.replace(/_/g, ' ')} disabled style={{ opacity: .6, textTransform: 'capitalize' }} />
              </div>
              {profileMsg && (
                <div style={{ fontSize: '.8rem', color: profileMsg.includes('Failed') ? 'var(--red)' : 'var(--green)', marginBottom: 8 }}>
                  {profileMsg}
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Security ── */}
      {tab === 'security' && (
        <div style={{ maxWidth: 520 }}>
          <div className="crd" style={{ marginBottom: 20 }}>
            <div className="crd-h">Change password</div>
            <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: 14 }}>
              Your password is shared across all CuraLog-connected projects.
            </p>
            <form onSubmit={changePassword}>
              <div className="form-grp">
                <label className="form-lbl">New password <span style={{ color: 'var(--text3)', fontWeight: 400 }}>— min. 8 characters</span></label>
                <input className="form-inp" data-1p-ignore autoComplete="new-password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" required />
              </div>
              <div className="form-grp">
                <label className="form-lbl">Confirm new password</label>
                <input className="form-inp" data-1p-ignore autoComplete="new-password" type="password" value={conPw} onChange={e => setConPw(e.target.value)} placeholder="Repeat new password" required />
              </div>
              {pwErr && <div style={{ fontSize: '.8rem', color: 'var(--red)', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, marginBottom: 10 }}>{pwErr}</div>}
              {pwMsg && <div style={{ fontSize: '.8rem', color: 'var(--green)', marginBottom: 10 }}>{pwMsg}</div>}
              <button type="submit" className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Update password'}</button>
            </form>
          </div>

          {/* ── Passkeys ── */}
          <div className="crd" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div className="crd-h" style={{ marginBottom: 0 }}>Passkeys</div>
              <button className="btn btn-secondary" style={{ fontSize: '.78rem', padding: '5px 12px' }} onClick={() => setShowEnroll(s => !s)}>
                {showEnroll ? 'Cancel' : '+ Add passkey'}
              </button>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: 14 }}>
              Sign in faster with Touch ID, Face ID, or a hardware security key. After your password login you'll verify with your passkey instead of a one-time code.
            </p>

            {showEnroll && (
              <form onSubmit={enrollPasskey} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                <div className="form-grp" style={{ marginBottom: 10 }}>
                  <label className="form-lbl">Passkey name <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— optional</span></label>
                  <input className="form-inp" value={newPkName} onChange={e => setNewPkName(e.target.value)} placeholder="e.g. MacBook Touch ID, iPhone Face ID" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={enrolling}>
                  {enrolling ? 'Waiting for device…' : 'Register passkey'}
                </button>
              </form>
            )}

            {pkLoading ? (
              <div style={{ fontSize: '.8rem', color: 'var(--text3)', padding: '8px 0' }}>Loading…</div>
            ) : passkeys.length === 0 ? (
              <div style={{ fontSize: '.82rem', color: 'var(--text3)', padding: '10px 0' }}>
                No passkeys enrolled. Add one above to enable faster, more secure sign-in.
              </div>
            ) : (
              <div>
                {passkeys.map((pk, i) => (
                  <div key={pk.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < passkeys.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{pk.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
                        Added {new Date(pk.created_at).toLocaleDateString()}
                        {pk.last_used && ` · Last used ${new Date(pk.last_used).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button onClick={() => deletePasskey(pk.id)} className="btn btn-ghost" style={{ fontSize: '.75rem', color: 'var(--red)', padding: '4px 10px' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pkMsg && (
              <div style={{ marginTop: 10, fontSize: '.8rem', color: pkMsg.includes('Failed') || pkMsg.includes('failed') ? 'var(--red)' : 'var(--green)' }}>
                {pkMsg}
              </div>
            )}
          </div>

          <div className="crd">
            <div className="crd-h">Session</div>
            <p style={{ fontSize: '.875rem', color: 'var(--text2)', marginBottom: 16 }}>
              Signed in as <strong>{user.email}</strong> · <strong style={{ textTransform: 'capitalize' }}>{user.role.replace(/_/g, ' ')}</strong>
            </p>
            <button className="btn btn-secondary" style={{ color: 'var(--red)' }} onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              await fetch('/api/auth/verify-otp', { method: 'DELETE' })
              window.location.href = '/login'
            }}>Sign out everywhere</button>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === 'notifications' && (
        <div style={{ maxWidth: 560 }}>
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 20 }}>
            Choose which events trigger notifications. Delivery preferences control how you receive them.
          </p>

          {groups.map(group => (
            <div key={group} className="crd" style={{ marginBottom: 16 }}>
              <div className="crd-h">{group}</div>
              {NOTIF_OPTIONS.filter(o => o.group === group).map((opt, i, arr) => (
                <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '.775rem', color: 'var(--text3)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <button onClick={() => togglePref(opt.key)}
                    style={{ width: 44, height: 24, borderRadius: 12, flexShrink: 0, background: prefs[opt.key] ? 'var(--teal)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: prefs[opt.key] ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                  </button>
                </div>
              ))}
            </div>
          ))}

          {/* ── Test Notifications ── */}
          <div className="crd" style={{ marginBottom: 16 }}>
            <div className="crd-h">Test your notifications</div>
            <p style={{ fontSize: '.82rem', color: 'var(--text2)', marginBottom: 16 }}>
              Send a real test message to your email and phone number on file. Make sure you've saved your phone number in the <button onClick={() => setTab('account')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontWeight: 600, fontSize: '.82rem', padding: 0 }}>Account tab</button> first.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              {/* Email test */}
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.8rem' }}>Email</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>{user.email}</div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '.75rem', padding: '6px' }}
                  disabled={!!testSending} onClick={() => sendTest('email')}>
                  {testSending === 'email' ? 'Sending…' : 'Send test email'}
                </button>
              </div>

              {/* SMS test */}
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.8rem' }}>SMS</div>
                    <div style={{ fontSize: '.68rem', color: user.phone ? 'var(--text3)' : 'var(--red)' }}>
                      {user.phone || 'No phone on file'}
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '.75rem', padding: '6px' }}
                  disabled={!!testSending || !user.phone} onClick={() => sendTest('sms')}>
                  {testSending === 'sms' ? 'Sending…' : 'Send test SMS'}
                </button>
              </div>

              {/* Both */}
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.8rem' }}>Both</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>Email + SMS together</div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '.75rem', padding: '6px' }}
                  disabled={!!testSending || !user.phone} onClick={() => sendTest('both')}>
                  {testSending === 'both' ? 'Sending…' : 'Send both'}
                </button>
              </div>
            </div>

            {testResult && (
              <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: '.8rem', fontWeight: 600, background: testResult.ok ? '#f0fdf4' : '#fef2f2', color: testResult.ok ? '#065f46' : '#dc2626', border: `1px solid ${testResult.ok ? '#bbf7d0' : '#fecaca'}` }}>
                {testResult.ok ? '✓ ' : '✗ '}{testResult.msg}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={savePrefs}>
            {prefsSaved ? '✓ Preferences saved' : 'Save preferences'}
          </button>
        </div>
      )}
    </div>
  )
}
