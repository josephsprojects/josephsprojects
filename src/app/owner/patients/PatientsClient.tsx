'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = ['#0E4F54','#5B3BA8','#C9762A','#1A7A42','#C0392B','#2980B9','#7B3F00','#1ABC9C']
const RELATIONSHIPS = ['Self','Spouse','Parent','Child','Sibling','Grandparent','Grandchild','Friend','Other']

interface Patient { id: string; workspace_id: string; name: string; dob?: string; relationship?: string; allergies: string; emergency_name?: string; emergency_phone?: string; notes?: string; color: string; status: string; _count: { medications: number }; workspace: { name: string } }
interface WS { id: string; name: string }

export default function PatientsClient({ initialPatients, workspaces }: { initialPatients: Patient[]; workspaces: WS[] }) {
  const router = useRouter()
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ workspace_id: workspaces[0]?.id || '', name: '', dob: '', relationship: '', allergies: 'None known', emergency_name: '', emergency_phone: '', notes: '', color: COLORS[0] })

  const filtered = patients.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))

  function openCreate() {
    setForm({ workspace_id: workspaces[0]?.id || '', name: '', dob: '', relationship: '', allergies: 'None known', emergency_name: '', emergency_phone: '', notes: '', color: COLORS[patients.length % COLORS.length] })
    setEditing(null); setError(''); setShowModal(true)
  }
  function openEdit(p: Patient) {
    setForm({ workspace_id: p.workspace_id, name: p.name, dob: p.dob || '', relationship: p.relationship || '', allergies: p.allergies, emergency_name: p.emergency_name || '', emergency_phone: p.emergency_phone || '', notes: p.notes || '', color: p.color })
    setEditing(p); setError(''); setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Patient name is required'); return }
    if (!form.workspace_id) { setError('Select a workspace'); return }
    setLoading(true); setError('')

    const method = editing ? 'PATCH' : 'POST'
    const url = editing ? `/api/patients?id=${editing.id}` : '/api/patients'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.message || 'Failed'); return }
    setShowModal(false); router.refresh()
    const ws = workspaces.find((w: any) => w.id === form.workspace_id)
    const newPt = { ...data.data, _count: { medications: 0 }, workspace: { name: ws?.name || '' } }
    setPatients(pts => editing ? pts.map((p: any) => p.id === editing.id ? { ...p, ...form, workspace: { name: ws?.name || '' } } : p) : [newPt, ...pts])
  }

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h2>Patients</h2><p>{patients.length} patient{patients.length !== 1 ? 's' : ''} across all workspaces</p></div>
        <button className="btn btn-primary" onClick={openCreate} disabled={workspaces.length === 0} title={workspaces.length === 0 ? 'Create a workspace first' : ''}>+ Add patient</button>
      </div>

      {workspaces.length === 0 && (
        <div className="crd" style={{ marginBottom: 20, borderLeft: '4px solid var(--amber)' }}>
          <p style={{ fontSize: '.875rem' }}>You need to <a href="/owner/workspaces" style={{ color: 'var(--teal)', fontWeight: 600 }}>create a workspace</a> before adding patients.</p>
        </div>
      )}

      {patients.length > 0 && (
        <div className="crd" style={{ marginBottom: 20, padding: '12px 16px' }}>
          <input className="form-inp" placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} style={{ margin: 0 }} />
        </div>
      )}

      {filtered.length === 0 && patients.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z"/></svg>
          <h3>No patients yet</h3>
          <p>Add your first patient to start tracking medications.</p>
          <button className="btn btn-primary" onClick={openCreate} disabled={workspaces.length === 0}>Add patient</button>
        </div>
      ) : (
        <div className="crd" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Patient</th><th>Workspace</th><th>Meds</th><th>Allergies</th><th>DOB</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {p.name.split(' ').map((x: any) => x[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.relationship && <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{p.relationship}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{p.workspace.name}</td>
                  <td><span className="badge badge-teal">{p._count.medications}</span></td>
                  <td style={{ fontSize: '.8rem', color: p.allergies !== 'None known' ? 'var(--red)' : 'var(--text3)' }}>{p.allergies}</td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{p.dob || '—'}</td>
                  <td>
                    <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '4px 10px' }} onClick={() => openEdit(p)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? 'Edit patient' : 'Add patient'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div style={{ color: 'var(--red)', fontSize: '.8rem', marginBottom: 12, background: '#fef2f2', padding: '8px 12px', borderRadius: 6 }}>{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Full name *</label>
                    <input className="form-inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First Last" required />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Workspace *</label>
                    <select className="form-inp" value={form.workspace_id} onChange={e => setForm(f => ({ ...f, workspace_id: e.target.value }))}>
                      {workspaces.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Relationship</label>
                    <select className="form-inp" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}>
                      <option value="">Select…</option>
                      {RELATIONSHIPS.map((r: any) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Date of birth</label>
                    <input className="form-inp" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Allergies</label>
                    <input className="form-inp" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="None known" />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Emergency contact name</label>
                    <input className="form-inp" value={form.emergency_name} onChange={e => setForm(f => ({ ...f, emergency_name: e.target.value }))} />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Emergency contact phone</label>
                    <input className="form-inp" value={form.emergency_phone} onChange={e => setForm(f => ({ ...f, emergency_phone: e.target.value }))} />
                  </div>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Notes</label>
                    <textarea className="form-inp" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                  </div>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Color</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {COLORS.map((col: any) => (
                        <button key={col} type="button" onClick={() => setForm(f => ({ ...f, color: col }))}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: form.color === col ? '3px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : editing ? 'Save changes' : 'Add patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
