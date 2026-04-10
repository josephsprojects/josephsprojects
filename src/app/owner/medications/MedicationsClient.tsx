'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Med { id: string; patient_id: string; name: string; generic?: string; dosage?: string; actual_dose?: string; form: string; frequency?: string; instructions?: string; status: string; days_supply: number; refills: number; last_fill?: string; patient: { name: string; color: string }; provider?: { name: string }; pharmacy?: { name: string } }
interface Patient { id: string; name: string; workspace_id: string }
interface WS { id: string; name: string }

const STATUS_COLORS: Record<string, string> = { active: 'badge-teal', on_hold: 'badge-amber', discontinued: 'badge-red', archived: 'badge-gray' }
const FORMS = ['Tablet','Capsule','Extended-Release','Liquid','Patch','Injection','Inhaler','Cream','Spray','Suppository','Softgel','Powder','Other']
const FREQS = ['Once daily','Twice daily (BID)','Three times daily (TID)','Four times daily (QID)','Every other day','Weekly','As needed (PRN)','At bedtime','Every morning','Custom']

export default function MedicationsClient({ initialMeds, patients, workspaces }: { initialMeds: Med[]; patients: Patient[]; workspaces: WS[] }) {
  const router = useRouter()
  const [meds, setMeds] = useState(initialMeds)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Autocomplete state
  const [medAC, setMedAC] = useState<any[]>([])
  const [npiAC, setNpiAC] = useState<any[]>([])
  const [pharmAC, setPharmAC] = useState<any[]>([])
  const medTimer = useRef<any>(undefined)
  const npiTimer = useRef<any>(undefined)
  const pharmTimer = useRef<any>(undefined)

  const [form, setForm] = useState({
    workspace_id: workspaces[0]?.id || '', patient_id: patients[0]?.id || '',
    name: '', generic: '', dosage: '', actual_dose: '', form: 'Tablet',
    frequency: '', instructions: '', purpose: '', quantity: 30,
    days_supply: 30, refills: 0, last_fill: new Date().toISOString().split('T')[0],
    provider_name: '', pharmacy_name: '', notes: ''
  })

  const f = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  // RxNorm autocomplete
  async function searchMed(val: string) {
    clearTimeout(medTimer.current)
    if (val.length < 2) { setMedAC([]); return }
    medTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medications/search?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setMedAC(data.data || [])
      } catch { setMedAC([]) }
    }, 300)
  }

  // NPI provider autocomplete
  async function searchProvider(val: string) {
    clearTimeout(npiTimer.current)
    if (val.length < 2) { setNpiAC([]); return }
    npiTimer.current = setTimeout(async () => {
      try {
        // Split name into parts for better searching
        const parts = val.trim().split(' ')
        const lastName = parts[parts.length - 1]
        const firstName = parts.length > 1 ? parts[0] : ''
        const params = new URLSearchParams({ last_name: lastName, limit: '10' })
        if (firstName) params.set('first_name', firstName)
        const res = await fetch(`/api/providers/search?${params}`)
        const data = await res.json()
        setNpiAC(data.data || [])
      } catch { setNpiAC([]) }
    }, 300)
  }

  // Pharmacy autocomplete
  async function searchPharmacy(val: string) {
    clearTimeout(pharmTimer.current)
    if (val.length < 2) { setPharmAC([]); return }
    pharmTimer.current = setTimeout(async () => {
      try {
        const isZip = /^\d{4,5}$/.test(val.trim())
        const params = new URLSearchParams(isZip ? { zip: val.trim() } : { name: val.trim() })
        const res = await fetch(`/api/pharmacies/search?${params}`)
        const data = await res.json()
        setPharmAC(data.data || [])
      } catch { setPharmAC([]) }
    }, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Medication name is required'); return }
    if (!form.patient_id) { setError('Select a patient'); return }
    setLoading(true); setError('')

    // If provider/pharmacy names are filled, upsert them
    let provider_id: string | undefined
    let pharmacy_id: string | undefined

    if (form.provider_name.trim()) {
      const pr = await fetch('/api/providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.provider_name }) })
      const pd = await pr.json()
      provider_id = pd.data?.id
    }

    if (form.pharmacy_name.trim()) {
      const ph = await fetch('/api/pharmacies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.pharmacy_name }) })
      const phd = await ph.json()
      pharmacy_id = phd.data?.id
    }

    const body = { ...form, provider_id, pharmacy_id }
    const res = await fetch('/api/medications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.message || 'Failed'); return }
    setShowModal(false); router.refresh()
  }

  const filtered = meds.filter((m: any) =>
    (statusFilter === 'all' || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.patient.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h2>Medications</h2><p>{meds.length} medication{meds.length !== 1 ? 's' : ''} total</p></div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true) }} disabled={patients.length === 0}>+ Add medication</button>
      </div>

      {patients.length === 0 && <div className="crd" style={{ marginBottom: 20, borderLeft: '4px solid var(--amber)' }}><p style={{ fontSize: '.875rem' }}>Add a <a href="/owner/patients" style={{ color: 'var(--teal)', fontWeight: 600 }}>patient</a> before adding medications.</p></div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="form-inp" placeholder="Search medications or patients…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, margin: 0 }} />
        {['all','active','on_hold','discontinued','archived'].map((s: any) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '.8rem', textTransform: 'capitalize' }}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          <h3>No medications found</h3>
          <p>{meds.length === 0 ? 'Add your first medication to start tracking.' : 'No medications match your filters.'}</p>
          {meds.length === 0 && <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={patients.length === 0}>Add medication</button>}
        </div>
      ) : (
        <div className="crd" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Medication</th><th>Patient</th><th>Dosage</th><th>Frequency</th><th>Days Left</th><th>Provider</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((m: any) => {
                const daysLeft = m.last_fill && m.days_supply
                  ? Math.max(0, m.days_supply - Math.floor((Date.now() - new Date(m.last_fill).getTime()) / 86400000))
                  : null
                return (
                  <tr key={m.id}>
                    <td><div style={{ fontWeight: 600 }}>{m.name}</div>{m.generic && <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{m.generic}</div>}</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 20, height: 20, borderRadius: '50%', background: m.patient.color, flexShrink: 0 }} />{m.patient.name}</div></td>
                    <td style={{ fontSize: '.85rem' }}>{[m.dosage, m.actual_dose && m.actual_dose !== m.dosage ? `(actual: ${m.actual_dose})` : null].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{m.frequency || '—'}</td>
                    <td>
                      {daysLeft !== null
                        ? <span style={{ fontWeight: 700, color: daysLeft <= 7 ? 'var(--red)' : daysLeft <= 14 ? 'var(--amber)' : 'var(--green)' }}>{daysLeft}d</span>
                        : <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{m.provider?.name || '—'}</td>
                    <td><span className={`badge ${STATUS_COLORS[m.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{m.status.replace('_', ' ')}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Add medication</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {error && <div style={{ gridColumn: '1/-1', color: 'var(--red)', fontSize: '.8rem', background: '#fef2f2', padding: '8px 12px', borderRadius: 6 }}>{error}</div>}

                {/* Medication name with RxNorm autocomplete */}
                <div className="form-grp" style={{ gridColumn: '1/-1', position: 'relative' }}>
                  <label className="form-lbl">Medication name * <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— type to search</span></label>
                  <input className="form-inp" value={form.name} onChange={e => { f('name', e.target.value); searchMed(e.target.value) }} onBlur={() => setTimeout(() => setMedAC([]), 200)} placeholder="e.g. Metformin, Lisinopril…" required />
                  {medAC.length > 0 && (
                    <div className="ac-list">
                      {medAC.map((m: any, i) => (
                        <div key={i} className="ac-item" onMouseDown={() => { f('name', m.name); f('generic', m.generic || ''); setMedAC([]) }}>
                          <div className="ac-item-name">{m.name}</div>
                          {m.generic && <div className="ac-item-sub">{m.generic}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-grp">
                  <label className="form-lbl">Generic name</label>
                  <input className="form-inp" value={form.generic} onChange={e => f('generic', e.target.value)} placeholder="e.g. metformin" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Patient *</label>
                  <select className="form-inp" value={form.patient_id} onChange={e => f('patient_id', e.target.value)}>
                    {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-grp">
                  <label className="form-lbl">Prescribed dosage</label>
                  <input className="form-inp" value={form.dosage} onChange={e => f('dosage', e.target.value)} placeholder="e.g. 500 mg" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Actual dose taken</label>
                  <input className="form-inp" value={form.actual_dose} onChange={e => f('actual_dose', e.target.value)} placeholder="e.g. ½ tablet, 250 mg" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Form</label>
                  <select className="form-inp" value={form.form} onChange={e => f('form', e.target.value)}>
                    {FORMS.map((fm: any) => <option key={fm} value={fm}>{fm}</option>)}
                  </select>
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Frequency</label>
                  <select className="form-inp" value={form.frequency} onChange={e => f('frequency', e.target.value)}>
                    <option value="">Select…</option>
                    {FREQS.map((fr: any) => <option key={fr} value={fr}>{fr}</option>)}
                  </select>
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Instructions</label>
                  <input className="form-inp" value={form.instructions} onChange={e => f('instructions', e.target.value)} placeholder="e.g. Take with food" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Purpose</label>
                  <input className="form-inp" value={form.purpose} onChange={e => f('purpose', e.target.value)} placeholder="e.g. Blood pressure" />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Days supply</label>
                  <input className="form-inp" type="number" min="1" value={form.days_supply} onChange={e => f('days_supply', parseInt(e.target.value))} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Refills remaining</label>
                  <input className="form-inp" type="number" min="0" value={form.refills} onChange={e => f('refills', parseInt(e.target.value))} />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Last fill date</label>
                  <input className="form-inp" type="date" value={form.last_fill} onChange={e => f('last_fill', e.target.value)} />
                </div>

                {/* Provider with NPI autocomplete */}
                <div className="form-grp" style={{ position: 'relative' }}>
                  <label className="form-lbl">Prescriber name <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— type first or last name</span></label>
                  <input className="form-inp" value={form.provider_name} onChange={e => { f('provider_name', e.target.value); searchProvider(e.target.value) }} onBlur={() => setTimeout(() => setNpiAC([]), 200)} placeholder="e.g. Dr. Smith or Mohammad Ahmed…" />
                  {npiAC.length > 0 && (
                    <div className="ac-list">
                      {npiAC.map((p: any, i) => (
                        <div key={i} className="ac-item" onMouseDown={() => { f('provider_name', `${p.name}${p.specialty ? ' — ' + p.specialty : ''}${p.city ? ' · ' + p.city + ', ' + p.state : ''}`); setNpiAC([]) }}>
                          <div className="ac-item-name">{p.name}</div>
                          <div className="ac-item-sub">{p.specialty}{p.city ? ` · ${p.city}, ${p.state}` : ''} · NPI {p.npi}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pharmacy with autocomplete */}
                <div className="form-grp" style={{ position: 'relative' }}>
                  <label className="form-lbl">Pharmacy <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— type pharmacy name or ZIP code</span></label>
                  <input className="form-inp" value={form.pharmacy_name} onChange={e => { f('pharmacy_name', e.target.value); searchPharmacy(e.target.value) }} onBlur={() => setTimeout(() => setPharmAC([]), 200)} placeholder="e.g. CVS Pharmacy, Walgreens, or 06850…" />
                  {pharmAC.length > 0 && (
                    <div className="ac-list">
                      {pharmAC.map((p: any, i) => (
                        <div key={i} className="ac-item" onMouseDown={() => { f('pharmacy_name', `${p.name}${p.address ? ' — ' + p.address : ''}`); setPharmAC([]) }}>
                          <div className="ac-item-name">{p.name}</div>
                          <div className="ac-item-sub">{p.address}{p.phone ? ` · ${p.phone}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                  <label className="form-lbl">Notes</label>
                  <textarea className="form-inp" value={form.notes} onChange={e => f('notes', e.target.value)} rows={2} />
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Add medication'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
