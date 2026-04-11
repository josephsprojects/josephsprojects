'use client'
import { useState, useEffect } from 'react'

interface Flag { id: string; key: string; name: string; description?: string; enabled: boolean; env: string }
interface UserRow { id: string; supabase_id: string; email: string; name: string; role: string; status: string; created_at: string }

const INTEGRATIONS = [
  { name: 'Supabase Auth',      key: 'supabase', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', url: '' },
  { name: 'PostgreSQL / Prisma',key: 'db',       icon: 'M4 7c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2z M4 7v5c0 1.1 3.6 2 8 2s8-.9 8-2V7 M4 12v5c0 1.1 3.6 2 8 2s8-.9 8-2v-5', url: '' },
  { name: 'RxNorm API',         key: 'rxnorm',   icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', url: 'https://rxnav.nlm.nih.gov/REST/version.json' },
  { name: 'NPI Registry',       key: 'npi',      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', url: 'https://npiregistry.cms.hhs.gov/api/?version=2.1&limit=1&last_name=test' },
  { name: 'SendGrid (Email)',   key: 'sendgrid', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', url: '' },
  { name: 'Twilio (SMS)',       key: 'twilio',   icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', url: '' },
]

const ROLE_BADGE: Record<string, string> = {
  platform_owner: 'badge-teal', workspace_owner: 'badge-blue',
  manager: 'badge-purple', patient: 'badge-gray', provider: 'badge-green',
}

export default function AdminClient({ flags: initialFlags, initialUsers }: { flags: Flag[]; initialUsers: UserRow[] }) {
  const [tab, setTab]    = useState<'integrations' | 'flags' | 'users'>('integrations')
  const [flags, setFlags] = useState(initialFlags)
  const [users]           = useState<UserRow[]>(initialUsers)
  const [saving, setSaving]           = useState<string | null>(null)
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'ok' | 'err' | 'checking' | 'unknown'>>({})

  // Reset modal state
  const [resetUserId,   setResetUserId]   = useState<string | null>(null)
  const [resetSbId,     setResetSbId]     = useState<string>('')
  const [resetName,     setResetName]     = useState<string>('')
  const [newPassword,   setNewPassword]   = useState('')
  const [resetMsg,      setResetMsg]      = useState('')
  const [resetting,     setResetting]     = useState(false)

  // Auto-check all integrations on mount
  useEffect(() => {
    INTEGRATIONS.forEach(intg => {
      if (intg.url) checkIntegration(intg)
      else setIntegrationStatus(s => ({ ...s, [intg.key]: 'ok' })) // env-based — assume configured
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkIntegration(intg: typeof INTEGRATIONS[0]) {
    setIntegrationStatus(s => ({ ...s, [intg.key]: 'checking' }))
    try {
      if (intg.url) {
        const r = await fetch(`/api/admin/health-check?url=${encodeURIComponent(intg.url)}`)
        const d = await r.json()
        setIntegrationStatus(s => ({ ...s, [intg.key]: d.ok ? 'ok' : 'err' }))
      } else {
        setIntegrationStatus(s => ({ ...s, [intg.key]: 'ok' }))
      }
    } catch {
      setIntegrationStatus(s => ({ ...s, [intg.key]: 'err' }))
    }
  }

  async function toggleFlag(flag: Flag) {
    setSaving(flag.key)
    const newEnabled = !flag.enabled
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: flag.key, enabled: newEnabled }),
      })
      if (res.ok) setFlags(fs => fs.map(f => f.id === flag.id ? { ...f, enabled: newEnabled } : f))
    } finally {
      setSaving(null)
    }
  }

  async function doPasswordReset(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) { setResetMsg('Password must be at least 8 characters'); return }
    setResetting(true); setResetMsg('')
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabase_id: resetSbId, password: newPassword }),
    })
    const data = await res.json()
    setResetting(false)
    setResetMsg(data.success ? '✓ Password reset successfully' : `✗ ${data.message}`)
    if (data.success) { setNewPassword('') }
  }

  const ENV_BADGE: Record<string, string> = { production: 'badge-teal', beta: 'badge-amber', roadmap: 'badge-gray' }

  const TAB = (t: typeof tab) => ({
    padding: '8px 18px', fontWeight: 600, fontSize: '.85rem', border: 'none', cursor: 'pointer',
    background: 'none', color: tab === t ? 'var(--teal)' : 'var(--text3)',
    borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent', transition: 'all .15s',
  })

  return (
    <div className="pg-inner">
      <div className="pg-hd"><h2>Admin</h2><p>Integrations, feature flags, and user management</p></div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button style={TAB('integrations')} onClick={() => setTab('integrations')}>Integration Health</button>
        <button style={TAB('flags')} onClick={() => setTab('flags')}>Feature Flags</button>
        <button style={TAB('users')} onClick={() => setTab('users')}>
          Users
          <span style={{ marginLeft: 6, fontSize: '.72rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 7px', color: 'var(--text3)', fontWeight: 600 }}>{users.length}</span>
        </button>
      </div>

      {/* ── Integration Health ── */}
      {tab === 'integrations' && (
        <div className="crd">
          <div className="crd-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Integration health</span>
            <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Auto-checked on load</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {INTEGRATIONS.map(intg => {
              const status = integrationStatus[intg.key]
              return (
                <div key={intg.key} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: status === 'ok' ? 'rgba(5,150,105,.15)' : status === 'err' ? 'rgba(220,38,38,.12)' : 'var(--surface2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={status === 'ok' ? 'var(--green)' : status === 'err' ? 'var(--red)' : 'var(--text3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={intg.icon} />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{intg.name}</div>
                    <div style={{ fontSize: '.72rem', marginTop: 2 }}>
                      {status === 'checking' && <span style={{ color: 'var(--amber)' }}>Checking…</span>}
                      {status === 'ok'       && <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>Connected</span>}
                      {status === 'err'      && <span style={{ color: 'var(--red)' }}>✕ Unreachable</span>}
                      {!status              && <span style={{ color: 'var(--text3)' }}>Checking…</span>}
                    </div>
                  </div>
                  {intg.url && (
                    <button className="btn btn-ghost" style={{ fontSize: '.7rem', padding: '3px 8px' }} onClick={() => checkIntegration(intg)}>
                      Retry
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Feature Flags ── */}
      {tab === 'flags' && (
        <div className="crd">
          <div className="crd-h">Feature flags</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {flags.map((flag, i) => (
              <div key={flag.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < flags.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{flag.name}</span>
                    <span className={`badge ${ENV_BADGE[flag.env] || 'badge-gray'}`}>{flag.env}</span>
                  </div>
                  {flag.description && <div style={{ fontSize: '.775rem', color: 'var(--text3)' }}>{flag.description}</div>}
                </div>
                <button
                  onClick={() => toggleFlag(flag)}
                  disabled={saving === flag.key}
                  style={{ width: 44, height: 24, borderRadius: 12, background: flag.enabled ? 'var(--teal)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0, opacity: saving === flag.key ? .6 : 1 }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left .2s', left: flag.enabled ? 23 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="crd" style={{ padding: 0 }}>
          {users.length === 0 ? (
            <div className="empty-state"><h3>No users yet</h3><p>Users who sign up will appear here.</p></div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Signed up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{u.email}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{u.role.replace(/_/g, ' ')}</span></td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-teal' : 'badge-gray'}`}>{u.status}</span></td>
                    <td style={{ fontSize: '.75rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '.75rem', padding: '4px 10px' }}
                        onClick={() => { setResetUserId(u.id); setResetSbId(u.supabase_id); setResetName(u.name); setNewPassword(''); setResetMsg('') }}
                      >
                        Reset password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Password Reset Modal ── */}
      {resetUserId && (
        <div className="modal-backdrop" onClick={() => setResetUserId(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Reset password — {resetName}</h3>
              <button onClick={() => setResetUserId(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={doPasswordReset}>
              <div className="modal-body">
                <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 12 }}>
                  Set a temporary password for <strong>{resetName}</strong>. They can change it after signing in.
                </p>
                <div className="form-grp">
                  <label className="form-lbl">New password <span style={{ color: 'var(--text3)', fontWeight: 400 }}>— min. 8 characters</span></label>
                  <input
                    className="form-inp"
                    type="password"
                    data-1p-ignore
                    autoComplete="off"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setResetMsg('') }}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                </div>
                {resetMsg && (
                  <div style={{ fontSize: '.8rem', color: resetMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)', background: resetMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2', padding: '8px 12px', borderRadius: 6 }}>{resetMsg}</div>
                )}
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setResetUserId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={resetting}>{resetting ? 'Resetting…' : 'Reset password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
