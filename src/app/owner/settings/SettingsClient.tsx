'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

type Tab = 'account' | 'security' | 'notifications'

export default function SettingsClient({ user }: { user: { id: string; name: string; email: string; role: string } }) {
  const [tab, setTab] = useState<Tab>('account')
  const [name, setName] = useState(user.name)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [conPw, setConPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true); setProfileMsg('')
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    })
    setSavingProfile(false)
    setProfileMsg(res.ok ? 'Profile saved.' : 'Failed to save.')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErr(''); setPwMsg('')
    if (newPw.length < 8) { setPwErr('Password must be at least 8 characters.'); return }
    if (newPw !== conPw) { setPwErr('Passwords do not match.'); return }
    setSavingPw(true)
    // Use Supabase to update password (user must be logged in)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSavingPw(false)
    if (error) { setPwErr(error.message); return }
    setPwMsg('Password updated successfully.')
    setCurPw(''); setNewPw(''); setConPw('')

    // Also update audit log
    await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', entityType: 'account', entityName: 'Password', field: 'password', fromValue: '●●●●', toValue: '●●●●' })
    })
  }

  const TAB_STYLE = (t: Tab) => ({
    padding: '8px 16px', fontWeight: 600, fontSize: '.875rem',
    border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent',
    background: 'none', color: tab === t ? 'var(--teal)' : 'var(--text3)', transition: 'all .15s'
  })

  return (
    <div className="pg-inner">
      <div className="pg-hd"><h2>Settings</h2><p>Manage your account and platform preferences</p></div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button style={TAB_STYLE('account')} onClick={() => setTab('account')}>Account</button>
        <button style={TAB_STYLE('security')} onClick={() => setTab('security')}>Security</button>
        <button style={TAB_STYLE('notifications')} onClick={() => setTab('notifications')}>Notifications</button>
      </div>

      {tab === 'account' && (
        <div style={{ maxWidth: 520 }}>
          <div className="crd" style={{ marginBottom: 20 }}>
            <div className="crd-h">Profile</div>
            <form onSubmit={saveProfile}>
              <div className="form-grp">
                <label className="form-lbl">Full name</label>
                <input className="form-inp" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-grp">
                <label className="form-lbl">Email</label>
                <input className="form-inp" value={user.email} disabled style={{ opacity: .6 }} />
                <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Email cannot be changed from this panel.</span>
              </div>
              <div className="form-grp">
                <label className="form-lbl">Role</label>
                <input className="form-inp" value={user.role.replace('_', ' ')} disabled style={{ opacity: .6, textTransform: 'capitalize' }} />
              </div>
              {profileMsg && <div style={{ fontSize: '.8rem', color: profileMsg.includes('Failed') ? 'var(--red)' : 'var(--green)', marginBottom: 8 }}>{profileMsg}</div>}
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
            </form>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div style={{ maxWidth: 520 }}>
          <div className="crd" style={{ marginBottom: 20 }}>
            <div className="crd-h">Change password</div>
            <form onSubmit={changePassword}>
              <div className="form-grp">
                <label className="form-lbl">New password</label>
                <input className="form-inp" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" required />
              </div>
              <div className="form-grp">
                <label className="form-lbl">Confirm new password</label>
                <input className="form-inp" type="password" value={conPw} onChange={e => setConPw(e.target.value)} placeholder="Repeat new password" required />
              </div>
              {pwErr && <div style={{ fontSize: '.8rem', color: 'var(--red)', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, marginBottom: 10 }}>{pwErr}</div>}
              {pwMsg && <div style={{ fontSize: '.8rem', color: 'var(--green)', marginBottom: 10 }}>{pwMsg}</div>}
              <button type="submit" className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Update password'}</button>
            </form>
          </div>

          <div className="crd">
            <div className="crd-h">Session</div>
            <p style={{ fontSize: '.875rem', color: 'var(--text2)', marginBottom: 16 }}>
              You are signed in as <strong>{user.email}</strong> with role <strong>{user.role.replace('_', ' ')}</strong>.
              Sessions expire after 8 hours of inactivity.
            </p>
            <button className="btn btn-secondary" style={{ color: 'var(--red)' }} onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}>Sign out everywhere</button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div style={{ maxWidth: 520 }}>
          <div className="crd">
            <div className="crd-h">Notification preferences</div>
            <p style={{ fontSize: '.875rem', color: 'var(--text2)' }}>
              Notification preferences can be configured per workspace and per patient.
              Global notification settings will be available in a future update.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
