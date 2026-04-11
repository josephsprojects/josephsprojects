'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type ViewMode = 'owner' | 'staff' | 'patient'

const ALL_NAV = [
  { section: 'Platform', roles: ['owner', 'staff'] },
  { href: '/owner', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', roles: ['owner', 'staff'] },
  { href: '/owner/workspaces', label: 'Workspaces', icon: 'M3 7h4v4H3zM10 7h4v4h-4zM3 14h4v4H3zM10 14h4v4h-4z', roles: ['owner', 'staff'] },
  { section: 'Clinical', roles: ['owner', 'staff'] },
  { href: '/owner/patients', label: 'Patients', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z', roles: ['owner', 'staff'] },
  { href: '/owner/medications', label: 'Medications', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', roles: ['owner', 'staff', 'patient'] },
  { href: '/owner/requests', label: 'Refill Requests', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 10H2', roles: ['owner', 'staff', 'patient'] },
  { section: 'Communication', roles: ['owner', 'staff', 'patient'] },
  { href: '/owner/notifications', label: 'Notifications', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0', roles: ['owner', 'staff', 'patient'] },
  { href: '/owner/messages', label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', roles: ['owner', 'staff', 'patient'] },
  { section: 'Admin', roles: ['owner'] },
  { href: '/owner/audit', label: 'Audit Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: ['owner'] },
  { href: '/owner/admin', label: 'Admin', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z', roles: ['owner'] },
  { href: '/owner/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['owner', 'staff', 'patient'] },
]

const VIEW_MODES: { key: ViewMode; label: string; color: string }[] = [
  { key: 'owner',   label: 'Owner',   color: 'var(--teal)' },
  { key: 'staff',   label: 'Staff',   color: '#8b5cf6' },
  { key: 'patient', label: 'Patient', color: '#f59e0b' },
]

interface Props {
  userName: string; userInitials: string; userRole: string
  isTestMode: boolean; badges?: Record<string, number>
}

export default function Sidebar({ userName, userInitials, userRole, isTestMode: initialTestMode, badges = {} }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('owner')
  const [testMode, setTestMode] = useState(initialTestMode)
  const [testLoading, setTestLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    await fetch('/api/auth/verify-otp', { method: 'DELETE' })
    router.push('/login')
  }

  async function toggleTestMode() {
    setTestLoading(true)
    const method = testMode ? 'DELETE' : 'POST'
    await fetch('/api/admin/test-mode', { method })
    setTestMode(!testMode)
    setTestLoading(false)
    router.refresh()
  }

  async function seedTestData() {
    setSeeding(true)
    await fetch('/api/admin/seed-test', { method: 'POST' })
    setSeeding(false)
    router.refresh()
  }

  async function clearTestData() {
    if (!confirm('Reset all demo data? This will delete all test patients and medications.')) return
    setSeeding(true)
    await fetch('/api/admin/seed-test', { method: 'DELETE' })
    setSeeding(false)
    router.refresh()
  }

  const visibleNav = ALL_NAV.filter(item => item.roles.includes(viewMode))
  const currentMode = VIEW_MODES.find(v => v.key === viewMode)!

  return (
    <aside className="sidebar">
      <div className="sb-logo" onClick={() => router.push('/owner')}>
        <div className="sb-logo-mark">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 2v4M8 10v4M2 8h4M10 8h4"/>
          </svg>
        </div>
        CuraLog
        {testMode && <span style={{ fontSize: '.55rem', background: '#eab308', color: '#713f12', borderRadius: 4, padding: '1px 5px', fontWeight: 700, marginLeft: 4 }}>TEST</span>}
      </div>

      {/* Preview as */}
      <div style={{ margin: '4px 8px 2px', padding: '6px 8px', background: 'rgba(255,255,255,.06)', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Preview as</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {VIEW_MODES.map(v => (
            <button key={v.key} onClick={() => setViewMode(v.key)}
              style={{ flex: 1, padding: '4px 0', fontSize: '.65rem', fontWeight: 700, border: 'none', borderRadius: 5, cursor: 'pointer', background: viewMode === v.key ? v.color : 'rgba(255,255,255,.08)', color: viewMode === v.key ? '#fff' : 'rgba(255,255,255,.45)', transition: 'all .15s' }}>
              {v.label}
            </button>
          ))}
        </div>
        {viewMode !== 'owner' && (
          <div style={{ fontSize: '.62rem', color: currentMode.color, marginTop: 5, fontWeight: 600, opacity: .9 }}>
            Previewing {currentMode.label} view
          </div>
        )}
      </div>

      {/* Test Mode */}
      <div style={{ margin: '4px 8px 2px', padding: '8px 10px', background: testMode ? 'rgba(234,179,8,.15)' : 'rgba(255,255,255,.04)', borderRadius: 8, border: `1px solid ${testMode ? 'rgba(234,179,8,.3)' : 'rgba(255,255,255,.06)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: testMode ? 8 : 0 }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: testMode ? '#fde68a' : 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Test Mode
            </div>
            {!testMode && <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.3)', marginTop: 1 }}>Safe demo environment</div>}
          </div>
          <button onClick={toggleTestMode} disabled={testLoading}
            style={{ width: 36, height: 20, borderRadius: 10, background: testMode ? '#eab308' : 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, opacity: testLoading ? .6 : 1 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: testMode ? 19 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.4)' }} />
          </button>
        </div>
        {testMode && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={seedTestData} disabled={seeding}
              style={{ flex: 1, fontSize: '.62rem', fontWeight: 700, padding: '4px 6px', borderRadius: 5, border: 'none', background: 'rgba(234,179,8,.25)', color: '#fde68a', cursor: 'pointer' }}>
              {seeding ? '…' : 'Seed data'}
            </button>
            <button onClick={clearTestData} disabled={seeding}
              style={{ flex: 1, fontSize: '.62rem', fontWeight: 700, padding: '4px 6px', borderRadius: 5, border: 'none', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
              Reset
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '8px 8px 0', flex: 1 }}>
        {visibleNav.map((item, i) => {
          if ('section' in item) {
            return <div key={i} className="sb-section">{item.section}</div>
          }
          const isActive = item.href === '/owner' ? pathname === '/owner' : pathname.startsWith(item.href)
          const badge = badges[item.label]
          return (
            <button key={item.href} className={`sb-link${isActive ? ' active' : ''}`} onClick={() => router.push(item.href)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}/>
              </svg>
              {item.label}
              {badge ? <span className="sb-badge">{badge > 99 ? '99+' : badge}</span> : null}
            </button>
          )
        })}
      </div>

      <div className="sb-user">
        <div className="sb-user-av">{userInitials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.5)', textTransform: 'capitalize' }}>{userRole.replace(/_/g, ' ')}</div>
        </div>
        <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', padding: '4px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
