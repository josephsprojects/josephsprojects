'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Workspace { id: string; name: string; type: string; description?: string; status: string; created_at: string; _count: { patients: number; members: number } }

const TYPE_LABELS: Record<string, string> = {
  family: 'Family', clinical: 'Clinical', assisted_living: 'Assisted Living',
  home_health: 'Home Health', specialty: 'Specialty'
}

export default function WorkspacesClient({ initialWorkspaces }: { initialWorkspaces: Workspace[] }) {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState(initialWorkspaces)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'family', description: '' })
  const [error, setError] = useState('')

  function openCreate() { setForm({ name: '', type: 'family', description: '' }); setEditing(null); setError(''); setShowModal(true) }
  function openEdit(ws: Workspace) { setForm({ name: ws.name, type: ws.type, description: ws.description || '' }); setEditing(ws); setError(''); setShowModal(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Workspace name is required'); return }
    setLoading(true); setError('')

    const method = editing ? 'PATCH' : 'POST'
    const url = editing ? `/api/workspaces?id=${editing.id}` : '/api/workspaces'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()

    setLoading(false)
    if (!data.success) { setError(data.message || 'Failed'); return }
    setShowModal(false)
    router.refresh()
    setWorkspaces(ws => editing ? ws.map((w: any) => w.id === editing.id ? { ...w, ...form } : w) : [data.data, ...ws])
  }

  async function archive(ws: Workspace) {
    if (!confirm(`Archive workspace "${ws.name}"? Patients and medications will be preserved.`)) return
    await fetch(`/api/workspaces?id=${ws.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) })
    router.refresh()
  }

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h2>Workspaces</h2><p>Organize patients and care teams into workspaces</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ New workspace</button>
      </div>

      {workspaces.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <h3>No workspaces yet</h3>
          <p>Create your first workspace to start organizing patients and medications.</p>
          <button className="btn btn-primary" onClick={openCreate}>Create workspace</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {workspaces.map((ws: any) => (
            <div key={ws.id} className="crd" style={{ cursor: 'pointer' }} onClick={() => openEdit(ws)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{ws.name}</div>
                  <span className="badge badge-teal">{TYPE_LABELS[ws.type] || ws.type}</span>
                </div>
                <span className={`badge ${ws.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{ws.status}</span>
              </div>
              {ws.description && <p style={{ fontSize: '.8rem', color: 'var(--text3)', marginBottom: 12 }}>{ws.description}</p>}
              <div style={{ display: 'flex', gap: 16, fontSize: '.8rem', color: 'var(--text3)' }}>
                <span><strong style={{ color: 'var(--text)' }}>{ws._count.patients}</strong> patients</span>
                <span><strong style={{ color: 'var(--text)' }}>{ws._count.members}</strong> members</span>
                <span>{new Date(ws.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                <button className="btn btn-secondary" style={{ fontSize: '.75rem', padding: '5px 12px' }} onClick={e => { e.stopPropagation(); openEdit(ws) }}>Edit</button>
                {ws.status === 'active' && <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '5px 12px', color: 'var(--red)' }} onClick={e => { e.stopPropagation(); archive(ws) }}>Archive</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>{editing ? 'Edit workspace' : 'New workspace'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div style={{ background: '#fef2f2', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: '.8rem', color: 'var(--red)' }}>{error}</div>}
                <div className="form-grp">
                  <label className="form-lbl">Workspace name <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="form-inp" data-1p-ignore autoComplete="off" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Smith Family Care" required />
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Type</label>
                  <select className="form-inp" data-1p-ignore autoComplete="off" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-grp">
                  <label className="form-lbl">Description</label>
                  <textarea className="form-inp" data-1p-ignore autoComplete="off" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Optional description" />
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : editing ? 'Save changes' : 'Create workspace'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
