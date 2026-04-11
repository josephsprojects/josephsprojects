'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Full status definitions
const STATUS_LABEL: Record<string, string> = {
  pending:               'Pending',
  sent_to_prescriber:    'Sent to Prescriber',
  submitted:             'Submitted',
  at_prescriber:         'At Prescriber',
  prescriber_approved:   'Prescriber Approved',
  prescriber_denied:     'Prescriber Denied',
  sent_to_pharmacy:      'Sent to Pharmacy',
  at_pharmacy:           'At Pharmacy',
  prior_auth_required:   'Prior Auth Required',
  prior_auth_submitted:  'Prior Auth Submitted',
  prior_auth_approved:   'Prior Auth Approved',
  prior_auth_denied:     'Prior Auth Denied',
  too_soon:              'Too Soon to Fill',
  insurance_issue:       'Insurance Issue',
  delay:                 'Delay',
  ready:                 'Ready for Pickup',
  picked_up:             'Picked Up',
  denied:                'Denied',
  cancelled:             'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  pending:               'badge-amber',
  sent_to_prescriber:    'badge-blue',
  submitted:             'badge-blue',
  at_prescriber:         'badge-purple',
  prescriber_approved:   'badge-teal',
  prescriber_denied:     'badge-red',
  sent_to_pharmacy:      'badge-blue',
  at_pharmacy:           'badge-blue',
  prior_auth_required:   'badge-amber',
  prior_auth_submitted:  'badge-amber',
  prior_auth_approved:   'badge-teal',
  prior_auth_denied:     'badge-red',
  too_soon:              'badge-amber',
  insurance_issue:       'badge-amber',
  delay:                 'badge-amber',
  ready:                 'badge-teal',
  picked_up:             'badge-green',
  denied:                'badge-red',
  cancelled:             'badge-gray',
}

// Visual pipeline stages shown to patient
const PIPELINE_STAGES = [
  { key: 'requested',   label: 'Requested',   statuses: ['pending','sent_to_prescriber','submitted'] },
  { key: 'prescriber',  label: 'Prescriber',  statuses: ['at_prescriber','prescriber_approved'] },
  { key: 'pharmacy',    label: 'Pharmacy',    statuses: ['sent_to_pharmacy','at_pharmacy','prior_auth_required','prior_auth_submitted','prior_auth_approved','too_soon','insurance_issue','delay'] },
  { key: 'ready',       label: 'Ready',       statuses: ['ready'] },
  { key: 'picked_up',   label: 'Picked Up',   statuses: ['picked_up'] },
]

// Next status options grouped by current status
const NEXT_STATUSES: Record<string, { value: string; label: string; requiresNote?: boolean; notePrompt?: string }[]> = {
  pending:              [{ value: 'sent_to_prescriber', label: 'Send to prescriber' }, { value: 'at_prescriber', label: 'At prescriber' }, { value: 'sent_to_pharmacy', label: 'Send to pharmacy' }, { value: 'cancelled', label: 'Cancel', requiresNote: true, notePrompt: 'Reason for cancellation' }],
  sent_to_prescriber:   [{ value: 'at_prescriber', label: 'At prescriber' }, { value: 'prescriber_approved', label: 'Prescriber approved' }, { value: 'prescriber_denied', label: 'Prescriber denied', requiresNote: true, notePrompt: 'Why did the prescriber deny?' }, { value: 'cancelled', label: 'Cancel' }],
  submitted:            [{ value: 'at_prescriber', label: 'At prescriber' }, { value: 'sent_to_pharmacy', label: 'Send to pharmacy' }],
  at_prescriber:        [{ value: 'prescriber_approved', label: 'Prescriber approved' }, { value: 'prescriber_denied', label: 'Prescriber denied', requiresNote: true, notePrompt: 'Why did the prescriber deny?' }, { value: 'sent_to_pharmacy', label: 'Send to pharmacy' }],
  prescriber_approved:  [{ value: 'sent_to_pharmacy', label: 'Send to pharmacy' }, { value: 'at_pharmacy', label: 'At pharmacy' }],
  prescriber_denied:    [{ value: 'sent_to_prescriber', label: 'Retry — send to prescriber' }, { value: 'denied', label: 'Mark denied', requiresNote: true, notePrompt: 'Final denial reason' }],
  sent_to_pharmacy:     [{ value: 'at_pharmacy', label: 'Pharmacy received' }, { value: 'prior_auth_required', label: 'Prior auth required', requiresNote: true, notePrompt: 'Which insurance, what medication?' }, { value: 'too_soon', label: 'Too soon to fill', notePrompt: 'How many days until eligible?' }, { value: 'insurance_issue', label: 'Insurance issue', requiresNote: true, notePrompt: 'Describe the issue' }, { value: 'delay', label: 'Delay', requiresNote: true, notePrompt: 'Describe the delay' }],
  at_pharmacy:          [{ value: 'prior_auth_required', label: 'Prior auth required', requiresNote: true, notePrompt: 'What authorization is needed?' }, { value: 'too_soon', label: 'Too soon to fill', notePrompt: 'Days until eligible?' }, { value: 'insurance_issue', label: 'Insurance issue', requiresNote: true, notePrompt: 'Describe the issue' }, { value: 'delay', label: 'Delay', requiresNote: true, notePrompt: 'Describe the delay' }, { value: 'ready', label: 'Ready for pickup' }],
  prior_auth_required:  [{ value: 'prior_auth_submitted', label: 'PA submitted to insurance' }, { value: 'prior_auth_denied', label: 'PA denied', requiresNote: true, notePrompt: 'Denial reason or appeal options' }],
  prior_auth_submitted: [{ value: 'prior_auth_approved', label: 'PA approved' }, { value: 'prior_auth_denied', label: 'PA denied', requiresNote: true, notePrompt: 'Denial reason or appeal options' }],
  prior_auth_approved:  [{ value: 'at_pharmacy', label: 'Back at pharmacy' }, { value: 'ready', label: 'Ready for pickup' }],
  prior_auth_denied:    [{ value: 'prior_auth_required', label: 'Retry PA' }, { value: 'denied', label: 'Mark denied', requiresNote: true, notePrompt: 'Final denial reason and next steps' }],
  too_soon:             [{ value: 'at_pharmacy', label: 'Now eligible — back at pharmacy' }, { value: 'ready', label: 'Ready for pickup' }],
  insurance_issue:      [{ value: 'at_pharmacy', label: 'Issue resolved — back at pharmacy' }, { value: 'ready', label: 'Ready for pickup' }, { value: 'denied', label: 'Mark denied', requiresNote: true }],
  delay:                [{ value: 'at_pharmacy', label: 'Delay resolved — back at pharmacy' }, { value: 'ready', label: 'Ready for pickup' }],
  ready:                [{ value: 'picked_up', label: '✓ Mark picked up' }],
}

const TERMINAL = ['picked_up', 'denied', 'prescriber_denied', 'prior_auth_denied', 'cancelled']
const ACTIVE_STATUSES = Object.keys(STATUS_LABEL).filter(s => !['picked_up','denied','cancelled'].includes(s))

interface RR {
  id: string; patient_id: string; status: string; method: string
  notes?: string; status_note?: string; created_at: string
  status_history?: any[]
  patient: { name: string; color: string; phone?: string | null; email?: string | null }
  medication?: { name: string } | null
}
interface Patient { id: string; name: string; workspace_id: string }
interface Med { id: string; name: string; patient_id: string }

export default function RequestsClient({ initialRequests, patients, medications }: { initialRequests: RR[]; patients: Patient[]; medications: Med[] }) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [filter, setFilter] = useState('active')
  const [showNew, setShowNew] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updateModal, setUpdateModal] = useState<RR | null>(null)
  const [nextStatus, setNextStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [notifyPatient, setNotifyPatient] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '')
  const [method, setMethod] = useState('electronic')
  const [notes, setNotes] = useState('')
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set())

  const patientMeds = medications.filter(m => m.patient_id === selectedPatient)

  const filtered = filter === 'active'
    ? requests.filter(r => !['picked_up','denied','cancelled'].includes(r.status))
    : filter === 'all' ? requests
    : requests.filter(r => r.status === filter)

  function openUpdateModal(rr: RR) {
    const options = NEXT_STATUSES[rr.status] || []
    setUpdateModal(rr)
    setNextStatus(options[0]?.value || '')
    setStatusNote('')
    setNotifyPatient(true)
  }

  const selectedOption = updateModal ? (NEXT_STATUSES[updateModal.status] || []).find(o => o.value === nextStatus) : null

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!updateModal || !nextStatus) return
    setUpdating(true)
    const res = await fetch(`/api/refill-requests?id=${updateModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, status_note: statusNote.trim() || undefined, notify_patient: notifyPatient }),
    })
    const data = await res.json()
    setUpdating(false)
    if (data.success) {
      setRequests(rrs => rrs.map(r => r.id === updateModal.id ? { ...r, status: nextStatus, status_note: statusNote.trim() || undefined } : r))
      setUpdateModal(null)
    }
  }

  async function createRequests(e: React.FormEvent) {
    e.preventDefault()
    const pt = patients.find(p => p.id === selectedPatient)
    if (!pt) return
    setSubmitting(true)
    const medIds = selectedMeds.size > 0 ? Array.from(selectedMeds) : [null]
    await Promise.all(medIds.map(medication_id =>
      fetch('/api/refill-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: selectedPatient, workspace_id: pt.workspace_id, method, notes: notes.trim() || undefined, ...(medication_id ? { medication_id } : {}) }),
      })
    ))
    setSubmitting(false)
    setShowNew(false)
    router.refresh()
  }

  function getPipelineStep(status: string) {
    if (['denied','prescriber_denied','prior_auth_denied','cancelled'].includes(status)) return -1
    return PIPELINE_STAGES.findIndex(s => s.statuses.includes(status))
  }

  const hasPatientContact = (rr: RR) => !!(rr.patient.phone || rr.patient.email)

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Refill Requests</h2>
          <p>Track prescriptions from request to pickup — update status and notify patients at every step</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)} disabled={patients.length === 0}>+ New request</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['active','Active'],['all','All'],['pending','Pending'],['prior_auth_required','Prior Auth'],['too_soon','Too Soon'],['ready','Ready'],['picked_up','Picked Up'],['denied','Denied']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={`btn ${filter === val ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '7px 14px', fontSize: '.8rem' }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 10H2"/></svg>
          <h3>No requests</h3>
          <p>{filter === 'active' ? 'No active refill requests.' : 'No requests match this filter.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(rr => {
            const step = getPipelineStep(rr.status)
            const isDenied = step === -1
            const isTerminal = TERMINAL.includes(rr.status)
            const nextOpts = NEXT_STATUSES[rr.status] || []
            const history = Array.isArray(rr.status_history) ? rr.status_history as any[] : []
            const isExpanded = expandedId === rr.id

            return (
              <div key={rr.id} className="crd">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: rr.patient.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>
                      {rr.patient.name.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{rr.patient.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
                        {new Date(rr.created_at).toLocaleDateString()} · {rr.method}
                        {rr.medication && <> · <strong style={{ color: 'var(--text2)' }}>{rr.medication.name}</strong></>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge ${STATUS_COLOR[rr.status] || 'badge-gray'}`}>{STATUS_LABEL[rr.status] || rr.status}</span>
                    <button onClick={() => setExpandedId(isExpanded ? null : rr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px 6px', fontSize: '.8rem' }}>
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Pipeline bar */}
                {!isDenied && (
                  <div style={{ display: 'flex', gap: 0, marginBottom: 12, position: 'relative' }}>
                    {PIPELINE_STAGES.map((stage, i) => {
                      const done = i < step
                      const active = i === step
                      return (
                        <div key={stage.key} style={{ flex: 1, position: 'relative' }}>
                          <div style={{ height: 4, background: done || active ? 'var(--teal)' : 'var(--border)', borderRadius: i === 0 ? '2px 0 0 2px' : i === PIPELINE_STAGES.length-1 ? '0 2px 2px 0' : 0 }} />
                          <div style={{ fontSize: '.62rem', color: done || active ? 'var(--teal)' : 'var(--text3)', fontWeight: active ? 700 : 400, marginTop: 4, whiteSpace: 'nowrap' }}>
                            {done ? '✓ ' : active ? '⟳ ' : ''}{stage.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Status note */}
                {rr.status_note && (
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: '.8rem', color: 'var(--text2)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text1)' }}>Note: </span>{rr.status_note}
                  </div>
                )}

                {/* History (expanded) */}
                {isExpanded && history.length > 0 && (
                  <div style={{ marginBottom: 12, borderLeft: '2px solid var(--border)', paddingLeft: 14 }}>
                    {history.map((h, i) => (
                      <div key={i} style={{ fontSize: '.75rem', color: 'var(--text3)', marginBottom: 6, display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--teal)', flexShrink: 0 }}>
                          {new Date(h.at).toLocaleDateString()} {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{STATUS_LABEL[h.status] || h.status}</span>
                        {h.note && <span style={{ color: 'var(--text3)' }}>— {h.note}</span>}
                        {h.by && <span style={{ color: 'var(--text3)', marginLeft: 'auto' }}>{h.by}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {!isTerminal && nextOpts.length > 0 && (
                  <button className="btn btn-primary" style={{ fontSize: '.78rem', padding: '6px 14px' }} onClick={() => openUpdateModal(rr)}>
                    Update status
                  </button>
                )}
                {isTerminal && <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontStyle: 'italic' }}>This request is complete.</div>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Update Status Modal ── */}
      {updateModal && (
        <div className="modal-backdrop" onClick={() => setUpdateModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <div>
                <h3>Update status</h3>
                <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginTop: 2 }}>
                  {updateModal.patient.name}{updateModal.medication ? ` · ${updateModal.medication.name}` : ''}
                </div>
              </div>
              <button onClick={() => setUpdateModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={submitUpdate}>
              <div className="modal-body">
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, fontSize: '.8rem', color: 'var(--text2)' }}>
                  Current: <strong>{STATUS_LABEL[updateModal.status]}</strong>
                </div>

                <div className="form-grp">
                  <label className="form-lbl">New status</label>
                  <select className="form-inp" value={nextStatus} onChange={e => { setNextStatus(e.target.value); setStatusNote('') }} required>
                    {(NEXT_STATUSES[updateModal.status] || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {selectedOption && (
                  <div className="form-grp">
                    <label className="form-lbl">
                      {selectedOption.notePrompt || 'Note for patient'}
                      {selectedOption.requiresNote && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
                    </label>
                    <textarea
                      className="form-inp"
                      rows={3}
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder={selectedOption.notePrompt || 'Optional note visible to patient…'}
                      required={selectedOption.requiresNote}
                    />
                  </div>
                )}

                {hasPatientContact(updateModal) && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={notifyPatient}
                      onChange={e => setNotifyPatient(e.target.checked)}
                      style={{ accentColor: 'var(--teal)', width: 15, height: 15 }}
                    />
                    <div>
                      <div style={{ fontSize: '.82rem', fontWeight: 600 }}>Notify patient</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
                        Send {[updateModal.patient.phone ? 'SMS' : null, updateModal.patient.email ? 'email' : null].filter(Boolean).join(' + ')} to {updateModal.patient.name}
                      </div>
                    </div>
                  </label>
                )}
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setUpdateModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating || (selectedOption?.requiresNote && !statusNote.trim())}>
                  {updating ? 'Saving…' : 'Update status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── New Request Modal ── */}
      {showNew && (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>New refill request</h3>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={createRequests}>
              <div className="modal-body">
                <div className="form-grp">
                  <label className="form-lbl">Patient</label>
                  <select className="form-inp" value={selectedPatient} onChange={e => { setSelectedPatient(e.target.value); setSelectedMeds(new Set()) }}>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-grp">
                  <label className="form-lbl" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Medications to refill</span>
                    {patientMeds.length > 0 && (
                      <button type="button" onClick={() => selectedMeds.size === patientMeds.length ? setSelectedMeds(new Set()) : setSelectedMeds(new Set(patientMeds.map(m => m.id)))} style={{ background: 'none', border: 'none', fontSize: '.75rem', color: 'var(--teal)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                        {selectedMeds.size === patientMeds.length ? 'Deselect all' : 'Select all'}
                      </button>
                    )}
                  </label>
                  {patientMeds.length === 0 ? (
                    <div style={{ padding: '10px 12px', fontSize: '.82rem', color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>No medications on file — a general request will be created.</div>
                  ) : (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      {patientMeds.map((med, i) => (
                        <label key={med.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', borderBottom: i < patientMeds.length-1 ? '1px solid var(--border)' : 'none', background: selectedMeds.has(med.id) ? 'rgba(13,148,136,.06)' : 'transparent' }}>
                          <input type="checkbox" checked={selectedMeds.has(med.id)} onChange={() => { const n = new Set(selectedMeds); n.has(med.id) ? n.delete(med.id) : n.add(med.id); setSelectedMeds(n) }} style={{ accentColor: 'var(--teal)', width: 15, height: 15 }} />
                          <span style={{ fontSize: '.875rem', fontWeight: selectedMeds.has(med.id) ? 600 : 400 }}>{med.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-grp">
                  <label className="form-lbl">Method</label>
                  <select className="form-inp" value={method} onChange={e => setMethod(e.target.value)}>
                    <option value="electronic">Electronic</option>
                    <option value="phone">Phone</option>
                    <option value="fax">Fax</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>

                <div className="form-grp">
                  <label className="form-lbl">Notes <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="form-inp" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions" />
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : selectedMeds.size > 1 ? `Create ${selectedMeds.size} requests` : 'Create request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
