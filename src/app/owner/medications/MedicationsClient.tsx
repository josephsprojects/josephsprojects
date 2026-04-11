'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Med {
  id: string; patient_id: string; workspace_id: string
  name: string; type: string; brand?: string; generic?: string
  dosage?: string; actual_dose?: string; form: string
  frequency?: string; instructions?: string; purpose?: string; notes?: string
  status: string; quantity: number; days_supply: number; refills: number
  quantity_home?: number; pickup_date?: string; notify_refill: boolean
  last_fill?: string; next_fill?: string; rxcui?: string
  patient: { name: string; color: string; phone?: string | null; email?: string | null }
  provider?: { name: string }
  pharmacy?: { name: string }
}
interface Patient { id: string; name: string; workspace_id: string }

// Forms where actual/split dose makes sense (tablets that can be cut)
const SPLITTABLE_FORMS = new Set(['Tablet', 'Chewable Tablet', 'Sublingual Tablet'])
const SUPPLEMENT_FORMS = ['Capsule','Tablet','Softgel','Gummy','Powder','Liquid','Oil','Spray','Chewable','Other']
const MED_FORMS = ['Tablet','Capsule','Extended-Release Tablet','Extended-Release Capsule','Liquid','Oral Solution','Patch','Injection','Inhaler','Cream','Gel','Ointment','Spray','Nasal Spray','Eye Drops','Ear Drops','Suppository','Softgel','Powder','Chewable Tablet','Sublingual Tablet','Other']
const FREQS = ['Once daily (QD)','Twice daily (BID)','Three times daily (TID)','Four times daily (QID)','Every 4 hours','Every 6 hours','Every 8 hours','Every 12 hours','Every other day','Weekly','Twice weekly','Monthly','As needed (PRN)','At bedtime (QHS)','Every morning','With meals','Before meals','After meals','Custom']
const SUPP_FREQS = ['Once daily','Twice daily','Three times daily','With meals','Every morning','Every night','Every other day','Weekly','As needed']

const STATUS_MAP: Record<string, { label: string; badge: string; section: 'taking'|'prescribed'|'inactive' }> = {
  active:       { label: 'Actively Taking',        badge: 'badge-teal', section: 'taking' },
  on_hold:      { label: 'Prescribed / Not Started', badge: 'badge-blue', section: 'prescribed' },
  discontinued: { label: 'Discontinued',            badge: 'badge-red',  section: 'inactive' },
  archived:     { label: 'Archived',                badge: 'badge-gray', section: 'inactive' },
}

function daysLeft(pickupDate?: string, lastFill?: string, daysSupply?: number) {
  const base = pickupDate || lastFill
  if (!base || !daysSupply) return null
  return Math.max(0, daysSupply - Math.floor((Date.now() - new Date(base).getTime()) / 86400000))
}

function RefillBar({ dl, total }: { dl: number; total: number }) {
  const pct = Math.min(100, Math.round((dl / Math.max(total, 1)) * 100))
  const color = pct > 40 ? 'var(--green)' : pct > 20 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.68rem', color: 'var(--text3)', marginBottom: 2 }}>
        <span style={{ fontWeight: 700, color }}>{dl}d left</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

function blankMed(patients: Patient[], type = 'medication') {
  return {
    type, patient_id: patients[0]?.id || '', workspace_id: patients[0]?.workspace_id || '',
    name: '', brand: '', generic: '', dosage: '', actual_dose: '',
    form: type === 'supplement' ? 'Capsule' : 'Tablet', frequency: '',
    instructions: '', purpose: '', quantity: 30, days_supply: 30,
    quantity_home: '' as string | number, pickup_date: '', refills: 0, notify_refill: true,
    last_fill: new Date().toISOString().split('T')[0], next_fill: '', status: 'active',
    provider_name: '', pharmacy_name: '', notes: '', rxcui: '',
  }
}

export default function MedicationsClient({ initialMeds, patients }: { initialMeds: Med[]; patients: Patient[] }) {
  const router = useRouter()
  const [meds, setMeds]           = useState(initialMeds)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState('')
  const [reminding, setReminding] = useState<string | null>(null)
  const [reminded, setReminded]   = useState<Record<string, string>>({}) // medId → 'sms'|'email'|'both'
  const [form, setForm]           = useState(() => blankMed(patients))
  const [wizardStep, setWizardStep] = useState(0) // for supplement wizard

  // Autocomplete
  const [medAC,   setMedAC]   = useState<any[]>([])
  const [strengths, setStrengths] = useState<string[]>([])
  const [loadingStrengths, setLoadingStrengths] = useState(false)
  const medTimer = useRef<any>(null)

  // Prescriber popup
  const [showProviderModal, setShowProviderModal] = useState(false)
  const [providerSearch, setProviderSearch]       = useState('')
  const [providerResults, setProviderResults]     = useState<any[]>([])
  const [searchingProvider, setSearchingProvider] = useState(false)
  const provTimer = useRef<any>(null)

  // Pharmacy popup
  const [showPharmacyModal, setShowPharmacyModal] = useState(false)
  const [pharmName, setPharmName]   = useState('')
  const [pharmZip, setPharmZip]     = useState('')
  const [pharmResults, setPharmResults] = useState<any[]>([])
  const [searchingPharm, setSearchingPharm] = useState(false)

  const f = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  function openAdd(type = 'medication') {
    setEditId(null); setForm(blankMed(patients, type)); setError(''); setWizardStep(0)
    setMedAC([]); setStrengths([]); setShowModal(true)
  }
  function openEdit(med: Med) {
    setEditId(med.id)
    setForm({
      type: med.type || 'medication',
      patient_id: med.patient_id, workspace_id: med.workspace_id,
      name: med.name, brand: med.brand || '', generic: med.generic || '',
      dosage: med.dosage || '', actual_dose: med.actual_dose || '',
      form: med.form, frequency: med.frequency || '', instructions: med.instructions || '',
      purpose: med.purpose || '', quantity: med.quantity, days_supply: med.days_supply,
      quantity_home: med.quantity_home ?? '', pickup_date: med.pickup_date || '',
      refills: med.refills, notify_refill: med.notify_refill ?? true,
      last_fill: med.last_fill || '', next_fill: med.next_fill || '',
      status: med.status, provider_name: med.provider?.name || '',
      pharmacy_name: med.pharmacy?.name || '', notes: med.notes || '', rxcui: med.rxcui || '',
    })
    setStrengths([]); setError(''); setWizardStep(0); setMedAC([])
    setShowModal(true)
  }

  async function handleDelete(med: Med) {
    if (!confirm(`Remove "${med.name}" for ${med.patient.name}? This cannot be undone.`)) return
    setDeleting(med.id)
    await fetch(`/api/medications/${med.id}`, { method: 'DELETE' })
    setDeleting(null)
    setMeds(prev => prev.filter(m => m.id !== med.id))
  }

  async function sendReminder(med: Med, channel: 'sms' | 'email' | 'both') {
    setReminding(med.id)
    const calls: Promise<any>[] = []
    if ((channel === 'sms' || channel === 'both') && med.patient.phone) {
      calls.push(fetch('/api/notifications/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: med.patient_id, medicationId: med.id }) }))
    }
    if ((channel === 'email' || channel === 'both') && med.patient.email) {
      calls.push(fetch('/api/notifications/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: med.patient_id, medicationId: med.id }) }))
    }
    await Promise.all(calls)
    setReminding(null)
    setReminded(prev => ({ ...prev, [med.id]: channel }))
    setTimeout(() => setReminded(prev => { const n = { ...prev }; delete n[med.id]; return n }), 4000)
  }

  // RxNorm search
  async function searchMed(val: string) {
    clearTimeout(medTimer.current)
    f('name', val)
    if (val.length < 2) { setMedAC([]); return }
    medTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medications/search?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setMedAC(data.data || [])
      } catch { setMedAC([]) }
    }, 250)
  }

  async function selectMedFromAC(m: any) {
    f('name', m.brand || m.name)
    f('brand', m.brand || '')
    f('generic', m.generic || '')
    if (m.rxcui) { f('rxcui', m.rxcui); fetchStrengths(m.rxcui) }
    setMedAC([])
  }

  async function fetchStrengths(rxcui: string) {
    setLoadingStrengths(true); setStrengths([])
    try {
      const res = await fetch(`/api/medications/strengths?rxcui=${rxcui}`)
      const data = await res.json()
      setStrengths(data.data || [])
    } finally { setLoadingStrengths(false) }
  }

  // Provider search
  async function runProviderSearch() {
    if (!providerSearch.trim()) return
    setSearchingProvider(true); setProviderResults([])
    try {
      const parts = providerSearch.trim().split(' ')
      const lastName = parts[parts.length - 1]
      const firstName = parts.length > 1 ? parts[0] : ''
      const params = new URLSearchParams({ last_name: lastName, limit: '15' })
      if (firstName) params.set('first_name', firstName)
      const res = await fetch(`/api/providers/search?${params}`)
      const data = await res.json()
      setProviderResults(data.data || [])
    } finally { setSearchingProvider(false) }
  }

  // Pharmacy search
  async function runPharmacySearch() {
    if (!pharmName.trim() && !pharmZip.trim()) return
    setSearchingPharm(true); setPharmResults([])
    try {
      const params = new URLSearchParams()
      if (pharmName.trim()) params.set('name', pharmName.trim())
      if (pharmZip.trim()) params.set('zip', pharmZip.trim())
      const res = await fetch(`/api/pharmacies/search?${params}`)
      const data = await res.json()
      setPharmResults(data.data || [])
    } finally { setSearchingPharm(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.patient_id)  { setError('Select a patient'); return }
    setLoading(true); setError('')

    let provider_id: string | undefined
    let pharmacy_id: string | undefined
    if (form.provider_name.trim()) {
      const pr = await fetch('/api/providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.provider_name }) })
      provider_id = (await pr.json()).data?.id
    }
    if (form.pharmacy_name.trim()) {
      const ph = await fetch('/api/pharmacies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.pharmacy_name }) })
      pharmacy_id = (await ph.json()).data?.id
    }

    const body: any = {
      workspace_id: form.workspace_id, patient_id: form.patient_id, type: form.type,
      name: form.name.trim(), brand: form.brand.trim() || undefined,
      generic: form.generic.trim() || undefined, dosage: form.dosage.trim() || undefined,
      actual_dose: SPLITTABLE_FORMS.has(form.form) ? (form.actual_dose.trim() || undefined) : undefined,
      form: form.form, frequency: form.frequency || undefined,
      instructions: form.instructions.trim() || undefined, purpose: form.purpose.trim() || undefined,
      quantity: Number(form.quantity), days_supply: Number(form.days_supply),
      quantity_home: form.quantity_home !== '' ? Number(form.quantity_home) : undefined,
      pickup_date: form.pickup_date || undefined,
      refills: Number(form.refills), notify_refill: form.notify_refill,
      last_fill: form.last_fill || undefined, next_fill: form.next_fill || undefined,
      status: form.status, rxcui: form.rxcui || undefined,
      notes: form.notes.trim() || undefined, provider_id, pharmacy_id,
    }

    const url    = editId ? `/api/medications/${editId}` : '/api/medications'
    const method = editId ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data   = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.message || 'Failed to save'); return }
    setShowModal(false); router.refresh()
  }

  const searchLower = search.toLowerCase()
  const filtered = meds.filter(m =>
    m.name.toLowerCase().includes(searchLower) ||
    (m.brand || '').toLowerCase().includes(searchLower) ||
    (m.generic || '').toLowerCase().includes(searchLower) ||
    m.patient.name.toLowerCase().includes(searchLower)
  )
  const taking    = filtered.filter(m => m.status === 'active')
  const prescribed = filtered.filter(m => m.status === 'on_hold')
  const inactive  = filtered.filter(m => m.status === 'discontinued' || m.status === 'archived')

  function MedRow({ med }: { med: Med }) {
    const dl = daysLeft(med.pickup_date, med.last_fill, med.days_supply)
    const s  = STATUS_MAP[med.status] || { label: med.status, badge: 'badge-gray' }
    const displayName = med.brand || med.name
    const hasSMS   = !!med.patient.phone
    const hasEmail = !!med.patient.email
    const hasRemind = (hasSMS || hasEmail) && med.status === 'active'
    const sentLabel = reminded[med.id]
    return (
      <tr>
        <td>
          <div style={{ fontWeight: 700 }}>{displayName}</div>
          {med.brand && med.name !== med.brand && <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{med.name}</div>}
          {med.generic && <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontStyle: 'italic' }}>{med.generic}</div>}
          {med.type === 'supplement' && <span style={{ fontSize: '.65rem', background: 'rgba(139,92,246,.12)', color: '#7c3aed', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>supplement</span>}
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: med.patient.color, flexShrink: 0 }} />
            {med.patient.name}
          </div>
        </td>
        <td style={{ fontSize: '.85rem' }}>{med.dosage || '—'}</td>
        <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{med.frequency || '—'}</td>
        <td style={{ minWidth: 90 }}>
          {dl !== null
            ? <><span style={{ fontWeight: 700, color: dl <= 7 ? 'var(--red)' : dl <= 14 ? 'var(--amber)' : 'var(--green)' }}>{dl}d</span><RefillBar dl={dl} total={med.days_supply} /></>
            : <span style={{ color: 'var(--text3)' }}>—</span>}
        </td>
        <td style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{med.provider?.name || '—'}</td>
        <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
        <td>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hasRemind && (
              sentLabel ? (
                <span style={{ fontSize: '.72rem', color: 'var(--teal)', fontWeight: 600, padding: '4px 6px' }}>✓ Sent</span>
              ) : (
                <div style={{ display: 'flex', gap: 4 }}>
                  {hasSMS && <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.72rem', color: '#7c3aed' }} disabled={reminding === med.id} onClick={() => sendReminder(med, 'sms')} title="Send SMS refill reminder">{reminding === med.id ? '…' : 'SMS'}</button>}
                  {hasEmail && <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.72rem', color: '#0369a1' }} disabled={reminding === med.id} onClick={() => sendReminder(med, 'email')} title="Send email refill reminder">{reminding === med.id ? '…' : 'Email'}</button>}
                </div>
              )
            )}
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '.75rem' }} onClick={() => openEdit(med)}>Edit</button>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '.75rem', color: 'var(--red)' }} disabled={deleting === med.id} onClick={() => handleDelete(med)}>{deleting === med.id ? '…' : 'Remove'}</button>
          </div>
        </td>
      </tr>
    )
  }

  function Section({ title, items, color }: { title: string; items: Med[]; color: string }) {
    if (items.length === 0) return null
    return (
      <>
        <tr><td colSpan={8} style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 6px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)' }}>{title}</span>
            <span style={{ fontSize: '.7rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 8px', color: 'var(--text3)', fontWeight: 600 }}>{items.length}</span>
          </div>
        </td></tr>
        {items.map(m => <MedRow key={m.id} med={m} />)}
      </>
    )
  }

  const isSupplement = form.type === 'supplement'
  const canSplit = SPLITTABLE_FORMS.has(form.form)

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Medications</h2>
          <p>{meds.length} total · {taking.length} actively taking · {prescribed.length} prescribed</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => openAdd('supplement')} disabled={patients.length === 0}>+ Add supplement</button>
          <button className="btn btn-primary"   onClick={() => openAdd('medication')} disabled={patients.length === 0}>+ Add medication</button>
        </div>
      </div>

      {patients.length === 0 && (
        <div className="crd" style={{ marginBottom: 20, borderLeft: '4px solid var(--amber)' }}>
          <p style={{ fontSize: '.875rem' }}>Add a <a href="/owner/patients" style={{ color: 'var(--teal)', fontWeight: 600 }}>patient</a> before adding medications.</p>
        </div>
      )}

      <input className="form-inp" data-1p-ignore autoComplete="off" placeholder="Search by name, brand, or patient…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 12h6M12 9v6"/></svg>
          <h3>No medications found</h3>
          <p>{meds.length === 0 ? 'Add your first medication to start tracking.' : 'No medications match your search.'}</p>
          {meds.length === 0 && <button className="btn btn-primary" onClick={() => openAdd()} disabled={patients.length === 0}>Add medication</button>}
        </div>
      ) : (
        <div className="crd" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Medication</th><th>Patient</th><th>Dosage</th><th>Frequency</th><th>Days Left</th><th>Prescriber</th><th>Status</th><th style={{ minWidth: 180 }}>Actions</th></tr></thead>
            <tbody>
              <Section title="Actively Taking" items={taking}    color="var(--teal)" />
              <Section title="Prescribed / Not Started" items={prescribed} color="#3b82f6" />
              <Section title="Discontinued / Archived" items={inactive} color="var(--text3)" />
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editId ? `Edit ${isSupplement ? 'supplement' : 'medication'}` : isSupplement ? 'Add supplement' : 'Add medication'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {error && <div style={{ gridColumn: '1/-1', color: 'var(--red)', fontSize: '.8rem', background: '#fef2f2', padding: '8px 12px', borderRadius: 6 }}>{error}</div>}

                {/* Type toggle — only on add */}
                {!editId && (
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Type</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['medication','supplement'].map(t => (
                        <button key={t} type="button" onClick={() => { f('type', t); setStrengths([]); setMedAC([]) }}
                          style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${form.type === t ? 'var(--teal)' : 'var(--border)'}`, background: form.type === t ? 'rgba(13,148,136,.08)' : 'var(--surface)', cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', color: form.type === t ? 'var(--teal)' : 'var(--text2)' }}>
                          {t === 'medication' ? 'Prescription Medication' : 'Supplement / Vitamin'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient + Status */}
                <div className="form-grp">
                  <label className="form-lbl">Patient *</label>
                  <select className="form-inp" data-1p-ignore autoComplete="off" value={form.patient_id} onChange={e => { const pt = patients.find(p => p.id === e.target.value); f('patient_id', e.target.value); if (pt) f('workspace_id', pt.workspace_id) }}>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Status</label>
                  <select className="form-inp" data-1p-ignore autoComplete="off" value={form.status} onChange={e => f('status', e.target.value)}>
                    <option value="active">Actively Taking</option>
                    <option value="on_hold">Prescribed (Not Yet Taking)</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Name with autocomplete */}
                <div className="form-grp" style={{ gridColumn: '1/-1', position: 'relative' }}>
                  <label className="form-lbl">
                    {isSupplement ? 'Supplement name *' : 'Medication name *'}
                    <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 6 }}>— type to search</span>
                  </label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={form.name}
                    onChange={e => isSupplement ? f('name', e.target.value) : searchMed(e.target.value)}
                    onBlur={() => setTimeout(() => setMedAC([]), 200)}
                    placeholder={isSupplement ? 'e.g. Vitamin D3, Magnesium Glycinate' : 'Start typing a brand or generic name…'}
                    required />
                  {medAC.length > 0 && (
                    <div className="ac-list">
                      {medAC.map((m: any, i: number) => (
                        <div key={i} className="ac-item" onMouseDown={() => selectMedFromAC(m)}>
                          <div style={{ fontWeight: 700, fontSize: '.875rem' }}>
                            {m.brand || m.name}
                            {m.brand && <span style={{ fontWeight: 400, fontSize: '.72rem', color: 'var(--teal)', marginLeft: 6, background: 'rgba(13,148,136,.1)', padding: '1px 5px', borderRadius: 4 }}>brand</span>}
                          </div>
                          {m.generic && m.generic !== (m.brand || m.name) && (
                            <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontStyle: 'italic', marginTop: 1 }}>Generic: {m.generic}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brand + Generic */}
                <div className="form-grp">
                  <label className="form-lbl">Brand name</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={form.brand} onChange={e => f('brand', e.target.value)} placeholder="Auto-filled from search" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Generic / ingredient name</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={form.generic} onChange={e => f('generic', e.target.value)} placeholder="Auto-filled from search" />
                </div>

                {/* Form */}
                <div className="form-grp">
                  <label className="form-lbl">Form</label>
                  <select className="form-inp" data-1p-ignore autoComplete="off" value={form.form} onChange={e => { f('form', e.target.value); if (!SPLITTABLE_FORMS.has(e.target.value)) f('actual_dose', '') }}>
                    {(isSupplement ? SUPPLEMENT_FORMS : MED_FORMS).map(fm => <option key={fm} value={fm}>{fm}</option>)}
                  </select>
                </div>

                {/* Dosage — dropdown if strengths available, else free text */}
                <div className="form-grp">
                  <label className="form-lbl">
                    Prescribed dosage
                    {loadingStrengths && <span style={{ fontSize: '.7rem', color: 'var(--text3)', marginLeft: 6 }}>Loading strengths…</span>}
                  </label>
                  {strengths.length > 0 ? (
                    <select className="form-inp" data-1p-ignore autoComplete="off" value={form.dosage} onChange={e => f('dosage', e.target.value)}>
                      <option value="">Select strength…</option>
                      {strengths.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="__other__">Other / custom</option>
                    </select>
                  ) : (
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.dosage} onChange={e => f('dosage', e.target.value)} placeholder="e.g. 10 mg, 500 mg" />
                  )}
                  {form.dosage === '__other__' && (
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={''} onChange={e => f('dosage', e.target.value)} placeholder="Enter custom dosage" style={{ marginTop: 6 }} />
                  )}
                </div>

                {/* Actual dose — only for splittable forms */}
                {canSplit && !isSupplement && (
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">
                      Actual dose taken
                      <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 6 }}>— if different from prescribed (e.g. half tablet)</span>
                    </label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.actual_dose} onChange={e => f('actual_dose', e.target.value)} placeholder="e.g. 5 mg (half tablet)" />
                  </div>
                )}

                {/* Frequency */}
                <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                  <label className="form-lbl">Frequency</label>
                  <select className="form-inp" data-1p-ignore autoComplete="off" value={form.frequency} onChange={e => f('frequency', e.target.value)}>
                    <option value="">Select…</option>
                    {(isSupplement ? SUPP_FREQS : FREQS).map(fr => <option key={fr} value={fr}>{fr}</option>)}
                  </select>
                </div>

                {/* Instructions + Purpose */}
                <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                  <label className="form-lbl">Instructions</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={form.instructions} onChange={e => f('instructions', e.target.value)} placeholder="e.g. Take with food, avoid grapefruit" />
                </div>
                <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                  <label className="form-lbl">Purpose / Condition</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={form.purpose} onChange={e => f('purpose', e.target.value)} placeholder="e.g. Type 2 Diabetes, Bone health" />
                </div>

                {/* Supply fields */}
                <div className="form-grp">
                  <label className="form-lbl">Quantity dispensed</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="number" min="1" value={form.quantity} onChange={e => f('quantity', parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Days supply</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="number" min="1" value={form.days_supply} onChange={e => f('days_supply', parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Supply at home <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— current units on hand</span></label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="number" min="0" value={form.quantity_home} onChange={e => f('quantity_home', e.target.value)} placeholder="e.g. 14 tablets remaining" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Refills remaining</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="number" min="0" value={form.refills} onChange={e => f('refills', parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Pharmacy pickup date <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— when picked up from pharmacy</span></label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="date" value={form.pickup_date} onChange={e => f('pickup_date', e.target.value)} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Dispensed to patient date</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="date" value={form.last_fill} onChange={e => f('last_fill', e.target.value)} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Next fill date</label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" type="date" value={form.next_fill} onChange={e => f('next_fill', e.target.value)} />
                </div>

                {/* Notifications toggle */}
                <div className="form-grp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label className="form-lbl" style={{ marginBottom: 0 }}>Refill notifications</label>
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Alert when supply is running low</div>
                  </div>
                  <button type="button" onClick={() => f('notify_refill', !form.notify_refill)}
                    style={{ width: 44, height: 24, borderRadius: 12, background: form.notify_refill ? 'var(--teal)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.notify_refill ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                  </button>
                </div>

                {/* Prescriber — popup button */}
                {!isSupplement && (
                  <div className="form-grp">
                    <label className="form-lbl">Prescriber</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input className="form-inp" data-1p-ignore autoComplete="off" value={form.provider_name} onChange={e => f('provider_name', e.target.value)} placeholder="Search or enter name" style={{ flex: 1 }} />
                      <button type="button" className="btn btn-secondary" style={{ padding: '0 10px', flexShrink: 0 }} onClick={() => { setProviderSearch(''); setProviderResults([]); setShowProviderModal(true) }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Pharmacy — popup button */}
                <div className="form-grp">
                  <label className="form-lbl">Pharmacy</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.pharmacy_name} onChange={e => f('pharmacy_name', e.target.value)} placeholder="Search or enter name" style={{ flex: 1 }} />
                    <button type="button" className="btn btn-secondary" style={{ padding: '0 10px', flexShrink: 0 }} onClick={() => { setPharmName(''); setPharmZip(''); setPharmResults([]); setShowPharmacyModal(true) }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </button>
                  </div>
                </div>

                <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                  <label className="form-lbl">Notes</label>
                  <textarea className="form-inp" data-1p-ignore autoComplete="off" value={form.notes} onChange={e => f('notes', e.target.value)} rows={2} placeholder="Any additional notes" />
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : editId ? 'Save changes' : isSupplement ? 'Add supplement' : 'Add medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Prescriber Search Modal ── */}
      {showProviderModal && (
        <div className="modal-backdrop" onClick={() => setShowProviderModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Search Prescriber (NPI Registry)</h3>
              <button onClick={() => setShowProviderModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input className="form-inp" data-1p-ignore autoComplete="off" value={providerSearch} onChange={e => setProviderSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), runProviderSearch())} placeholder="Last name or full name" style={{ flex: 1, margin: 0 }} />
                <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={runProviderSearch} disabled={searchingProvider}>{searchingProvider ? '…' : 'Search'}</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                {providerResults.map((p: any, i: number) => (
                  <button key={i} type="button" onClick={() => { f('provider_name', p.name); setShowProviderModal(false) }}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{p.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{p.specialty}{p.city ? ` · ${p.city}, ${p.state}` : ''} · NPI {p.npi}</div>
                  </button>
                ))}
                {providerResults.length === 0 && !searchingProvider && providerSearch && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: '.85rem' }}>No results — try a different name or enter manually above</div>
                )}
              </div>
            </div>
            <div className="modal-ft">
              <button type="button" className="btn btn-secondary" onClick={() => setShowProviderModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pharmacy Search Modal ── */}
      {showPharmacyModal && (
        <div className="modal-backdrop" onClick={() => setShowPharmacyModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Search Pharmacy</h3>
              <button onClick={() => setShowPharmacyModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 8, marginBottom: 16 }}>
                <input className="form-inp" data-1p-ignore autoComplete="off" value={pharmName} onChange={e => setPharmName(e.target.value)} placeholder="Pharmacy name" style={{ margin: 0 }} />
                <input className="form-inp" data-1p-ignore autoComplete="off" value={pharmZip} onChange={e => setPharmZip(e.target.value)} placeholder="ZIP code" style={{ margin: 0 }} />
                <button className="btn btn-primary" onClick={runPharmacySearch} disabled={searchingPharm}>{searchingPharm ? '…' : 'Search'}</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                {pharmResults.map((p: any, i: number) => (
                  <button key={i} type="button" onClick={() => { f('pharmacy_name', p.name); setShowPharmacyModal(false) }}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{p.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{p.address}{p.phone ? ` · ${p.phone}` : ''}</div>
                  </button>
                ))}
                {pharmResults.length === 0 && !searchingPharm && (pharmName || pharmZip) && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: '.85rem' }}>No results — try a different name or ZIP, or enter manually</div>
                )}
              </div>
            </div>
            <div className="modal-ft">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPharmacyModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
