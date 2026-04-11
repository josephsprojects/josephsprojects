'use client'
import { useState } from 'react'

// ── Refill tracker helpers ──────────────────────────────────────────────────
const PATIENT_STATUS_MSG: Record<string, string> = {
  pending:               'Your request has been received and is being reviewed.',
  sent_to_prescriber:    "We've sent the refill request to your prescriber.",
  submitted:             'Your refill request has been submitted.',
  at_prescriber:         'Your prescriber is reviewing the refill request.',
  prescriber_approved:   "Great news — your prescriber approved the refill! It's being sent to your pharmacy.",
  prescriber_denied:     'Your prescriber was unable to approve this refill. Please contact your care team.',
  sent_to_pharmacy:      'The prescription has been sent to your pharmacy.',
  at_pharmacy:           'Your pharmacy has received the prescription and is processing it.',
  prior_auth_required:   "Your insurance requires prior authorization for this medication. We're working on it.",
  prior_auth_submitted:  "Prior authorization has been submitted to your insurance. We'll update you when we hear back.",
  prior_auth_approved:   'Prior authorization approved! Your pharmacy will now fill the prescription.',
  prior_auth_denied:     'Prior authorization was denied. Please contact your care team for next steps.',
  too_soon:              "It's too early to refill based on your insurance plan. We'll reach out when it's eligible.",
  insurance_issue:       "There's an issue with your insurance coverage. We're working to resolve it.",
  delay:                 "There's a delay with your refill. We're working to resolve it as quickly as possible.",
  ready:                 '🎉 Your prescription is ready for pickup at your pharmacy!',
  picked_up:             'Prescription picked up. Take care!',
  denied:                'This refill was not approved. Please contact your care team.',
  cancelled:             'This request was cancelled.',
}

// SVG icons per status — rendered inline
const STATUS_ICON_SVG: Record<string, React.ReactNode> = {
  pending:               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  sent_to_prescriber:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  submitted:             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  at_prescriber:         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  prescriber_approved:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  prescriber_denied:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  sent_to_pharmacy:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  at_pharmacy:           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 14h6M12 11v6"/></svg>,
  prior_auth_required:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  prior_auth_submitted:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  prior_auth_approved:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  prior_auth_denied:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  too_soon:              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  insurance_issue:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  delay:                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="2" y1="2" x2="5" y2="5"/></svg>,
  ready:                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  picked_up:             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  denied:                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  cancelled:             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
}

const PIPELINE_STAGES = [
  { key: 'requested',  label: 'Requested',  statuses: ['pending','sent_to_prescriber','submitted'] },
  { key: 'prescriber', label: 'Prescriber', statuses: ['at_prescriber','prescriber_approved'] },
  { key: 'pharmacy',   label: 'Pharmacy',   statuses: ['sent_to_pharmacy','at_pharmacy','prior_auth_required','prior_auth_submitted','prior_auth_approved','too_soon','insurance_issue','delay'] },
  { key: 'ready',      label: 'Ready',      statuses: ['ready'] },
  { key: 'done',       label: 'Picked Up',  statuses: ['picked_up'] },
]

function getStepIndex(status: string) {
  return PIPELINE_STAGES.findIndex(s => s.statuses.includes(status))
}

const BLOCKED = ['prescriber_denied','prior_auth_denied','denied','cancelled']
const STATUS_COLOR_PORTAL: Record<string, { bg: string; text: string; border: string }> = {
  ready:             { bg: '#f0fdf4', text: '#059669', border: '#bbf7d0' },
  prescriber_denied: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  prior_auth_denied: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  denied:            { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  prior_auth_required:  { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  prior_auth_submitted: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  too_soon:          { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  insurance_issue:   { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  delay:             { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
}

interface RefillRequest {
  id: string; status: string; status_note?: string; method: string
  notes?: string; created_at: string; updated_at: string
  status_history?: any[]
  medication?: { name: string } | null
}

function RefillTracker({ requests }: { requests: RefillRequest[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>💊</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>No active refill requests</div>
        <div style={{ fontSize: '.85rem' }}>Your care team will update you when a refill is in progress.</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {requests.map(rr => {
        const step = getStepIndex(rr.status)
        const isBlocked = BLOCKED.includes(rr.status)
        const colors = STATUS_COLOR_PORTAL[rr.status] || { bg: '#f0fdf4', text: '#0d9488', border: '#bbf7d0' }
        const history = Array.isArray(rr.status_history) ? rr.status_history as any[] : []
        const isExpanded = expandedId === rr.id

        return (
          <div key={rr.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {/* Status banner */}
            <div style={{ background: colors.bg, borderBottom: `1px solid ${colors.border}`, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>{STATUS_ICON_SVG[rr.status] || STATUS_ICON_SVG.pending}</div>
              <div style={{ flex: 1 }}>
                {rr.medication && <div style={{ fontWeight: 700, color: '#111827', fontSize: '.95rem', marginBottom: 4 }}>{rr.medication.name}</div>}
                <div style={{ fontSize: '.85rem', color: colors.text, fontWeight: 600 }}>{PATIENT_STATUS_MSG[rr.status]}</div>
                {rr.status_note && (
                  <div style={{ marginTop: 6, fontSize: '.8rem', color: '#4b5563', padding: '6px 10px', background: 'rgba(0,0,0,.04)', borderRadius: 6 }}>
                    <strong>From your care team:</strong> {rr.status_note}
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline */}
            {!isBlocked && (
              <div style={{ padding: '14px 20px 8px' }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {PIPELINE_STAGES.map((stage, i) => {
                    const done = i < step
                    const active = i === step
                    return (
                      <div key={stage.key} style={{ flex: 1 }}>
                        <div style={{ height: 5, background: done || active ? '#0d9488' : '#e5e7eb', borderRadius: i === 0 ? '3px 0 0 3px' : i === PIPELINE_STAGES.length-1 ? '0 3px 3px 0' : 0 }} />
                        <div style={{ fontSize: '.65rem', color: done || active ? '#0d9488' : '#9ca3af', fontWeight: active ? 700 : 400, marginTop: 5, whiteSpace: 'nowrap' }}>
                          {done ? '✓ ' : active ? '● ' : ''}{stage.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: '8px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '.72rem', color: '#9ca3af' }}>
                Requested {new Date(rr.created_at).toLocaleDateString()} · Updated {new Date(rr.updated_at).toLocaleDateString()}
              </div>
              {history.length > 1 && (
                <button onClick={() => setExpandedId(isExpanded ? null : rr.id)} style={{ background: 'none', border: 'none', fontSize: '.75rem', color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}>
                  {isExpanded ? 'Hide history' : `View history (${history.length})`}
                </button>
              )}
            </div>

            {isExpanded && history.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 20px' }}>
                {[...history].reverse().map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: '.8rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d9488', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{PATIENT_STATUS_MSG[h.status]?.split('.')[0] || h.status}</span>
                      {h.note && <span style={{ color: '#6b7280' }}> — {h.note}</span>}
                      <div style={{ color: '#9ca3af', fontSize: '.7rem', marginTop: 1 }}>{new Date(h.at).toLocaleDateString()} at {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

interface Med {
  id: string; name: string; brand?: string; generic?: string; dosage?: string
  form: string; frequency?: string; instructions?: string; purpose?: string
  status: string; quantity: number; days_supply: number; refills: number
  quantity_home?: number; pickup_date?: string; last_fill?: string; next_fill?: string; type: string
  provider?: { name: string; phone?: string; fax?: string } | null
  pharmacy?: { name: string; phone?: string; address?: string } | null
}

interface Patient {
  id: string; name: string; dob?: string; allergies: string; color: string
  medications: Med[]
}

const STATUS_LABEL: Record<string,string> = { active: 'Actively Taking', on_hold: 'Prescribed', discontinued: 'Discontinued', archived: 'Archived' }
const STATUS_COLOR: Record<string,string> = { active: 'badge-teal', on_hold: 'badge-blue', discontinued: 'badge-red', archived: 'badge-gray' }

function daysLeft(pickupDate?: string, lastFill?: string, daysSupply?: number) {
  const base = pickupDate || lastFill
  if (!base || !daysSupply) return null
  const elapsed = Math.floor((Date.now() - new Date(base).getTime()) / 86400000)
  return Math.max(0, daysSupply - elapsed)
}

function RefillBar({ days, total }: { days: number; total: number }) {
  const pct = Math.min(100, Math.round((days / Math.max(total, 1)) * 100))
  const color = pct > 40 ? '#059669' : pct > 20 ? '#d97706' : '#dc2626'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#6b7280', marginBottom: 3 }}>
        <span style={{ fontWeight: 600, color }}>{days}d left</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

export default function PortalClient({ patient, shareCode, refillRequests = [] }: { patient: Patient; shareCode: string; refillRequests?: RefillRequest[] }) {
  const [verified, setVerified] = useState(!patient.dob)
  const [dobInput, setDobInput] = useState('')
  const [dobErr, setDobErr]     = useState('')
  const [tab, setTab]           = useState<'medications'|'refills'>('medications')
  const [filter, setFilter]     = useState<'all'|'active'|'on_hold'>('active')
  const [exportMode, setExportMode] = useState(false)
  const [exportSelected, setExportSelected] = useState<Set<string>>(new Set())

  function verifyDOB(e: React.FormEvent) {
    e.preventDefault()
    if (dobInput === patient.dob) { setVerified(true); setDobErr('') }
    else setDobErr('Date of birth does not match our records.')
  }

  function toggleExport(id: string) {
    setExportSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function printSelected() {
    window.print()
  }

  const meds = patient.medications.filter(m => {
    if (filter === 'active')  return m.status === 'active'
    if (filter === 'on_hold') return m.status === 'on_hold'
    return true
  })

  if (!verified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 400, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>CuraLog</div>
              <div style={{ fontSize: '.75rem', color: '#6b7280' }}>Medication Portal</div>
            </div>
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 6 }}>Verify your identity</h2>
          <p style={{ fontSize: '.85rem', color: '#6b7280', marginBottom: 20 }}>Enter your date of birth to view {patient.name}'s medication list.</p>
          <form onSubmit={verifyDOB}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Date of birth</label>
              <input
                type="date"
                value={dobInput}
                onChange={e => { setDobInput(e.target.value); setDobErr('') }}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {dobErr && <div style={{ fontSize: '.8rem', color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>{dobErr}</div>}
            <button type="submit" style={{ width: '100%', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
              View medications
            </button>
          </form>
        </div>
      </div>
    )
  }

  const initials = patient.name.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 800, color: '#0d9488', fontSize: '1.1rem' }}>CuraLog</div>
          <span style={{ color: '#d1d5db' }}>·</span>
          <span style={{ fontSize: '.85rem', color: '#6b7280' }}>Medication Portal</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setTab('medications'); setExportMode(false) }} style={{ background: tab === 'medications' ? '#0d9488' : '#f3f4f6', color: tab === 'medications' ? '#fff' : '#374151', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}>Medications</button>
          <button onClick={() => { setTab('refills'); setExportMode(false) }} style={{ position: 'relative', background: tab === 'refills' ? '#0d9488' : '#f3f4f6', color: tab === 'refills' ? '#fff' : '#374151', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}>
            Refill Tracker
            {refillRequests.length > 0 && <span style={{ marginLeft: 6, background: tab === 'refills' ? 'rgba(255,255,255,.3)' : '#0d9488', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: '.65rem' }}>{refillRequests.length}</span>}
          </button>
          {tab === 'medications' && (
            <button onClick={() => { setExportMode(!exportMode); setExportSelected(new Set()) }} style={{ background: exportMode ? '#0d9488' : '#f3f4f6', color: exportMode ? '#fff' : '#374151', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}>
              {exportMode ? 'Cancel' : 'Export / Print'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {/* Patient card */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: patient.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{patient.name}</div>
            {patient.allergies && patient.allergies !== 'None known' && (
              <div style={{ fontSize: '.8rem', color: '#dc2626', fontWeight: 600, marginTop: 2 }}>Allergies: {patient.allergies}</div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '.75rem', color: '#9ca3af' }}>{patient.medications.length} medications on file</div>
        </div>

        {/* Refill Tracker tab */}
        {tab === 'refills' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: 4 }}>Your refill requests</div>
            <p style={{ fontSize: '.82rem', color: '#6b7280', marginBottom: 16 }}>Track your prescriptions from request to pickup in real time.</p>
            <RefillTracker requests={refillRequests} />
          </div>
        )}

        {/* Medications tab */}
        {tab === 'medications' && <>

        {/* Export mode */}
        {exportMode && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#065f46' }}>Select medications to include in export</div>
              <div style={{ fontSize: '.75rem', color: '#059669', marginTop: 2 }}>{exportSelected.size} selected</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setExportSelected(new Set(patient.medications.map(m => m.id)))} style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '5px 12px', fontSize: '.75rem', cursor: 'pointer', fontWeight: 600 }}>Select all</button>
              <button onClick={printSelected} disabled={exportSelected.size === 0} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: '.75rem', cursor: 'pointer', fontWeight: 600, opacity: exportSelected.size === 0 ? .5 : 1 }}>Print / Save PDF</button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {!exportMode && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['active','on_hold','all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', fontSize: '.8rem', fontWeight: 600, borderRadius: 20, border: '1px solid', cursor: 'pointer', transition: 'all .15s', background: filter === f ? '#0d9488' : '#fff', color: filter === f ? '#fff' : '#6b7280', borderColor: filter === f ? '#0d9488' : '#d1d5db' }}>
                {f === 'active' ? 'Actively Taking' : f === 'on_hold' ? 'Prescribed' : 'All'}
              </button>
            ))}
          </div>
        )}

        {/* Medication cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="print-content">
          {(exportMode ? patient.medications : meds).map(med => {
            const dl = daysLeft(med.pickup_date, med.last_fill, med.days_supply)
            const displayName = med.brand || med.name
            const isSelected = exportSelected.has(med.id)
            if (exportMode && !isSelected && exportSelected.size > 0) {
              // dim unselected in export mode
            }
            return (
              <div key={med.id}
                onClick={() => exportMode && toggleExport(med.id)}
                style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${exportMode && isSelected ? '#0d9488' : '#e5e7eb'}`, padding: '16px 20px', cursor: exportMode ? 'pointer' : 'default', opacity: exportMode && exportSelected.size > 0 && !isSelected ? .5 : 1, transition: 'all .15s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{displayName}</div>
                    {med.brand && med.name !== med.brand && <div style={{ fontSize: '.75rem', color: '#6b7280', fontStyle: 'italic' }}>{med.name}</div>}
                    {med.generic && <div style={{ fontSize: '.72rem', color: '#9ca3af' }}>Generic: {med.generic}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {exportMode && <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isSelected ? '#0d9488' : '#d1d5db'}`, background: isSelected ? '#0d9488' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}</div>}
                    <span style={{ fontSize: '.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: med.status === 'active' ? '#ccfbf1' : med.status === 'on_hold' ? '#dbeafe' : '#f3f4f6', color: med.status === 'active' ? '#0f766e' : med.status === 'on_hold' ? '#1d4ed8' : '#6b7280' }}>{STATUS_LABEL[med.status] || med.status}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, fontSize: '.8rem', color: '#4b5563' }}>
                  {med.dosage    && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>DOSE</span><div style={{ fontWeight: 600 }}>{med.dosage}</div></div>}
                  {med.form      && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>FORM</span><div style={{ fontWeight: 600 }}>{med.form}</div></div>}
                  {med.frequency && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>FREQUENCY</span><div style={{ fontWeight: 600 }}>{med.frequency}</div></div>}
                  {med.refills !== undefined && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>REFILLS</span><div style={{ fontWeight: 600 }}>{med.refills}</div></div>}
                  {med.quantity_home != null && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>SUPPLY AT HOME</span><div style={{ fontWeight: 600 }}>{med.quantity_home} units</div></div>}
                  {med.pickup_date && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>LAST PICKUP</span><div style={{ fontWeight: 600 }}>{new Date(med.pickup_date).toLocaleDateString()}</div></div>}
                  {med.provider  && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>PRESCRIBER</span><div style={{ fontWeight: 600 }}>{med.provider.name}</div></div>}
                  {med.pharmacy  && <div><span style={{ color: '#9ca3af', fontSize: '.7rem' }}>PHARMACY</span><div style={{ fontWeight: 600 }}>{med.pharmacy.name}</div></div>}
                </div>

                {med.instructions && <div style={{ marginTop: 8, fontSize: '.78rem', color: '#6b7280', background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>Instructions: {med.instructions}</div>}
                {med.purpose && <div style={{ marginTop: 4, fontSize: '.78rem', color: '#6b7280' }}>For: {med.purpose}</div>}

                {dl !== null && med.status === 'active' && (
                  <RefillBar days={dl} total={med.days_supply} />
                )}
              </div>
            )
          })}
          {meds.length === 0 && !exportMode && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              No medications in this category.
            </div>
          )}
        </div>

        {/* end medications tab */}
        {tab === 'medications' && (
          <div style={{ marginTop: 32, textAlign: 'center', fontSize: '.72rem', color: '#9ca3af' }}>
            Powered by CuraLog · This page is shared via a private link. Do not share the URL with others.
          </div>
        )}
        </>}
      </div>

      <style>{`
        @media print {
          body > *:not(.print-content) { display: none !important; }
          .print-content { display: block !important; }
        }
      `}</style>
    </div>
  )
}
