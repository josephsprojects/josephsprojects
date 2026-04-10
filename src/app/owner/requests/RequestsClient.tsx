'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PIPELINE = ['pending','submitted','at_prescriber','at_pharmacy','ready','picked_up']
const STATUS_LABEL: Record<string,string> = { pending:'Pending',submitted:'Submitted',at_prescriber:'At Prescriber',at_pharmacy:'At Pharmacy',ready:'Ready',picked_up:'Picked Up',denied:'Denied' }
const STATUS_COLOR: Record<string,string> = { pending:'badge-amber',submitted:'badge-blue',at_prescriber:'badge-purple',at_pharmacy:'badge-blue',ready:'badge-teal',picked_up:'badge-green',denied:'badge-red' }

interface RR { id: string; patient_id: string; status: string; method: string; notes?: string; created_at: string; patient: { name: string; color: string }; status_history?: any[] }
interface Patient { id: string; name: string }

export default function RequestsClient({ initialRequests, patients }: { initialRequests: RR[]; patients: Patient[] }) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ patient_id: patients[0]?.id || '', notes: '', method: 'electronic' })

  const filtered = filter === 'active'
    ? requests.filter((r: any) => !['picked_up','denied'].includes(r.status))
    : filter === 'all' ? requests : requests.filter((r: any) => r.status === filter)

  async function updateStatus(id: string, status: string) {
    setLoading(id)
    const res = await fetch(`/api/refill-requests?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const data = await res.json()
    setLoading(null)
    if (data.success) {
      setRequests(rrs => rrs.map((r: any) => r.id === id ? { ...r, status } : r))
    }
  }

  async function createRequest(e: React.FormEvent) {
    e.preventDefault()
    const pt = patients.find((p: any) => p.id === newForm.patient_id)
    if (!pt) return
    const ws = (pt as any).workspace_id
    const res = await fetch('/api/refill-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newForm, workspace_id: ws }) })
    const data = await res.json()
    if (data.success) { setShowNew(false); router.refresh() }
  }

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h2>Refill Requests</h2><p>Track prescription refill status from request to pickup</p></div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)} disabled={patients.length === 0}>+ New request</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['active','Active'],['all','All'],['pending','Pending'],['ready','Ready'],['picked_up','Picked Up'],['denied','Denied']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={`btn ${filter === val ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '7px 14px', fontSize: '.8rem' }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 10H2"/></svg>
          <h3>No requests</h3>
          <p>{filter === 'active' ? 'No active refill requests.' : 'No requests match this filter.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((rr: any) => {
            const currentStep = PIPELINE.indexOf(rr.status)
            return (
              <div key={rr.id} className="crd">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: rr.patient.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>
                      {rr.patient.name.split(' ').map((x: any) => x[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{rr.patient.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{new Date(rr.created_at).toLocaleDateString()} · {rr.method}</div>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLOR[rr.status] || 'badge-gray'}`}>{STATUS_LABEL[rr.status] || rr.status}</span>
                </div>

                {/* Pipeline */}
                {rr.status !== 'denied' && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                    {PIPELINE.map((s, i) => (
                      <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentStep ? 'var(--teal)' : 'var(--border)' }} title={STATUS_LABEL[s]} />
                    ))}
                  </div>
                )}

                {rr.notes && <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginBottom: 12 }}>{rr.notes}</p>}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {rr.status === 'pending' && <>
                    <button className="btn btn-primary" style={{ fontSize: '.75rem', padding: '5px 12px' }} disabled={loading === rr.id} onClick={() => updateStatus(rr.id, 'submitted')}>Mark submitted</button>
                    <button className="btn btn-secondary" style={{ fontSize: '.75rem', padding: '5px 12px', color: 'var(--red)' }} onClick={() => updateStatus(rr.id, 'denied')}>Deny</button>
                  </>}
                  {rr.status === 'submitted' && <button className="btn btn-secondary" style={{ fontSize: '.75rem', padding: '5px 12px' }} onClick={() => updateStatus(rr.id, 'at_prescriber')}>At prescriber</button>}
                  {rr.status === 'at_prescriber' && <button className="btn btn-secondary" style={{ fontSize: '.75rem', padding: '5px 12px' }} onClick={() => updateStatus(rr.id, 'at_pharmacy')}>At pharmacy</button>}
                  {rr.status === 'at_pharmacy' && <button className="btn btn-primary" style={{ fontSize: '.75rem', padding: '5px 12px' }} onClick={() => updateStatus(rr.id, 'ready')}>Ready for pickup</button>}
                  {rr.status === 'ready' && <button className="btn btn-primary" style={{ fontSize: '.75rem', padding: '5px 12px' }} onClick={() => updateStatus(rr.id, 'picked_up')}>✓ Picked up</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showNew && (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd"><h3>New refill request</h3><button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button></div>
            <form onSubmit={createRequest}>
              <div className="modal-body">
                <div className="form-grp"><label className="form-lbl">Patient</label>
                  <select className="form-inp" value={newForm.patient_id} onChange={e => setNewForm(f => ({ ...f, patient_id: e.target.value }))}>
                    {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select></div>
                <div className="form-grp"><label className="form-lbl">Method</label>
                  <select className="form-inp" value={newForm.method} onChange={e => setNewForm(f => ({ ...f, method: e.target.value }))}>
                    <option value="electronic">Electronic</option><option value="phone">Phone</option><option value="fax">Fax</option><option value="in_person">In Person</option>
                  </select></div>
                <div className="form-grp"><label className="form-lbl">Notes</label>
                  <textarea className="form-inp" value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
