'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = ['#0E4F54','#5B3BA8','#C9762A','#1A7A42','#C0392B','#2980B9','#7B3F00','#1ABC9C']
const RELATIONSHIPS = ['Self','Spouse','Parent','Child','Sibling','Grandparent','Grandchild','Friend','Other']

interface Patient {
  id: string; workspace_id: string; name: string; dob?: string; relationship?: string
  phone?: string; email?: string; allergies: string; emergency_name?: string
  emergency_phone?: string; notes?: string; color: string; status: string
  share_code?: string; _count: { medications: number }; workspace: { name: string }
}
interface WS { id: string; name: string }

export default function PatientsClient({ initialPatients, workspaces }: { initialPatients: Patient[]; workspaces: WS[] }) {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ workspace_id: workspaces[0]?.id || '', name: '', dob: '', relationship: '', phone: '', email: '', allergies: 'None known', emergency_name: '', emergency_phone: '', notes: '', color: COLORS[0] })

  // Share portal state
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [shareModal, setShareModal] = useState<Patient | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  function openCreate() {
    setForm({ workspace_id: workspaces[0]?.id || '', name: '', dob: '', relationship: '', phone: '', email: '', allergies: 'None known', emergency_name: '', emergency_phone: '', notes: '', color: COLORS[patients.length % COLORS.length] })
    setEditing(null); setError(''); setShowModal(true)
  }
  function openEdit(p: Patient) {
    setForm({ workspace_id: p.workspace_id, name: p.name, dob: p.dob || '', relationship: p.relationship || '', phone: p.phone || '', email: p.email || '', allergies: p.allergies, emergency_name: p.emergency_name || '', emergency_phone: p.emergency_phone || '', notes: p.notes || '', color: p.color })
    setEditing(p); setError(''); setShowModal(true)
  }

  async function handleRemove(p: Patient) {
    if (!confirm(`Remove "${p.name}"? All medications and refill requests for this patient will also be deleted. This cannot be undone.`)) return
    setRemoving(p.id)
    const res = await fetch(`/api/patients/${p.id}`, { method: 'DELETE' })
    setRemoving(null)
    if (res.ok) setPatients(pts => pts.filter(pt => pt.id !== p.id))
    else alert('Failed to remove patient. Please try again.')
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
    const ws = workspaces.find(w => w.id === form.workspace_id)
    const newPt = { ...data.data, _count: { medications: 0 }, workspace: { name: ws?.name || '' } }
    setPatients(pts => editing ? pts.map(p => p.id === editing.id ? { ...p, ...form, workspace: { name: ws?.name || '' } } : p) : [newPt, ...pts])
  }

  async function generateShareLink(p: Patient) {
    setSharingId(p.id)
    const res = await fetch(`/api/patients/share?id=${p.id}`, { method: 'POST' })
    const data = await res.json()
    setSharingId(null)
    if (data.success) {
      const updated = { ...p, share_code: data.data.code }
      setPatients(pts => pts.map(pt => pt.id === p.id ? updated : pt))
      setShareModal(updated)
    } else {
      alert('Failed to generate share link.')
    }
  }

  async function revokeShareLink(p: Patient) {
    if (!confirm(`Revoke the share link for "${p.name}"? The patient will no longer be able to access their portal with the current link.`)) return
    await fetch(`/api/patients/share?id=${p.id}`, { method: 'DELETE' })
    const updated = { ...p, share_code: undefined }
    setPatients(pts => pts.map(pt => pt.id === p.id ? updated : pt))
    if (shareModal?.id === p.id) setShareModal(null)
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/portal/${code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <input className="form-inp" data-1p-ignore autoComplete="off" placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} style={{ margin: 0 }} />
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
            <thead><tr><th>Patient</th><th>Workspace</th><th>Meds</th><th>Allergies</th><th>DOB</th><th>Portal</th><th></th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {p.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.relationship && <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{p.relationship}</div>}
                        {(p.phone || p.email) && <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{[p.phone, p.email].filter(Boolean).join(' · ')}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{p.workspace.name}</td>
                  <td><span className="badge badge-teal">{p._count.medications}</span></td>
                  <td style={{ fontSize: '.8rem', color: p.allergies !== 'None known' ? 'var(--red)' : 'var(--text3)' }}>{p.allergies}</td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{p.dob || '—'}</td>
                  <td>
                    {p.share_code ? (
                      <button className="btn btn-ghost" style={{ fontSize: '.72rem', padding: '3px 8px', color: 'var(--teal)' }} onClick={() => { setCopied(false); setShareModal(p) }}>
                        View link
                      </button>
                    ) : (
                      <button className="btn btn-ghost" style={{ fontSize: '.72rem', padding: '3px 8px' }} disabled={sharingId === p.id} onClick={() => generateShareLink(p)}>
                        {sharingId === p.id ? '…' : 'Share'}
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '4px 10px' }} onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-secondary" style={{ fontSize: '.75rem', padding: '4px 10px', color: 'var(--red)' }} disabled={removing === p.id} onClick={() => handleRemove(p)}>{removing === p.id ? '…' : 'Remove'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Patient Modal ── */}
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
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Workspace *</label>
                    <select className="form-inp" data-1p-ignore autoComplete="off" value={form.workspace_id} onChange={e => setForm(f => ({ ...f, workspace_id: e.target.value }))}>
                      {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Relationship</label>
                    <select className="form-inp" data-1p-ignore autoComplete="off" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}>
                      <option value="">Select…</option>
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Date of birth <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— used to verify portal access</span></label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Phone <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— for refill notifications</span></label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 555-867-5309" />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Email <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— for refill notifications</span></label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="patient@email.com" />
                  </div>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Allergies</label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="None known" />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Emergency contact name</label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.emergency_name} onChange={e => setForm(f => ({ ...f, emergency_name: e.target.value }))} />
                  </div>
                  <div className="form-grp">
                    <label className="form-lbl">Emergency contact phone</label>
                    <input className="form-inp" data-1p-ignore autoComplete="off" value={form.emergency_phone} onChange={e => setForm(f => ({ ...f, emergency_phone: e.target.value }))} />
                  </div>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Notes</label>
                    <textarea className="form-inp" data-1p-ignore autoComplete="off" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                  </div>
                  <div className="form-grp" style={{ gridColumn: '1/-1' }}>
                    <label className="form-lbl">Color</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {COLORS.map(col => (
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

      {/* ── Share Portal Modal ── */}
      {shareModal && (
        <div className="modal-backdrop" onClick={() => setShareModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Patient Portal — {shareModal.name}</h3>
              <button onClick={() => setShareModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text3)', marginBottom: 6 }}>Portal link</div>
                <div style={{ fontSize: '.85rem', wordBreak: 'break-all', color: 'var(--teal)', fontWeight: 600, marginBottom: 10 }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/portal/${shareModal.share_code}` : `/portal/${shareModal.share_code}`}
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => copyLink(shareModal.share_code!)}>
                  {copied ? '✓ Copied!' : 'Copy link'}
                </button>
              </div>

              <div style={{ fontSize: '.8rem', color: 'var(--text3)', marginBottom: 16 }}>
                <strong style={{ color: 'var(--text2)' }}>How it works:</strong> Send this link to {shareModal.name}. When they open it, they'll be asked to verify their date of birth
                {shareModal.dob ? '' : ' (no DOB set — they can skip verification)'}. They can view their medication list, refill status, and save it as a PDF.
              </div>

              {!shareModal.dob && (
                <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: '.8rem', color: '#854d0e' }}>
                  No date of birth on file — add one in Edit to require identity verification before portal access.
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShareModal(null); openEdit(shareModal) }}>Edit patient</button>
                <button className="btn btn-ghost" style={{ flex: 1, color: 'var(--red)' }} onClick={() => revokeShareLink(shareModal)}>Revoke link</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
