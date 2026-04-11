'use client'
import { useState } from 'react'

interface LogEntry {
  id: string; user_name?: string; action: string; entity_type: string
  entity_name?: string; field?: string; from_value?: string; to_value?: string
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  create: 'badge-teal', update: 'badge-blue', delete: 'badge-red',
  login: 'badge-gray', logout: 'badge-gray', approve: 'badge-green',
  deny: 'badge-red', upload: 'badge-purple', invite: 'badge-amber',
}

export default function AuditClient({ initialLogs }: { initialLogs: LogEntry[] }) {
  const [logs, setLogs]       = useState(initialLogs)
  const [clearing, setClearing] = useState(false)
  const [filter, setFilter]   = useState('')

  async function clearAll() {
    if (!confirm(`Clear all ${logs.length} audit log entries? This cannot be undone.`)) return
    setClearing(true)
    const res = await fetch('/api/audit/clear', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setClearing(false)
    if (res.ok) setLogs([])
  }

  const filtered = filter
    ? logs.filter(l =>
        (l.user_name || '').toLowerCase().includes(filter.toLowerCase()) ||
        l.action.toLowerCase().includes(filter.toLowerCase()) ||
        l.entity_type.toLowerCase().includes(filter.toLowerCase()) ||
        (l.entity_name || '').toLowerCase().includes(filter.toLowerCase())
      )
    : logs

  return (
    <div className="pg-inner">
      <div className="pg-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Audit Log</h2>
          <p>{logs.length} entries — complete record of all platform actions</p>
        </div>
        <button
          className="btn btn-secondary"
          style={{ color: 'var(--red)', fontSize: '.8rem' }}
          onClick={clearAll}
          disabled={clearing || logs.length === 0}
        >
          {clearing ? 'Clearing…' : 'Clear all logs'}
        </button>
      </div>

      <input
        className="form-inp"
        data-1p-ignore
        autoComplete="off"
        placeholder="Filter by user, action, or entity…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div className="crd" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>{logs.length === 0 ? 'No audit entries yet' : 'No entries match your filter'}</h3>
            <p>{logs.length === 0 ? 'Actions taken on the platform will appear here.' : 'Try a different search.'}</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Type</th>
                <th>Entity</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '.75rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '.85rem' }}>{log.user_name || 'System'}</td>
                  <td><span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`}>{log.action}</span></td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text2)', textTransform: 'capitalize' }}>{log.entity_type}</td>
                  <td style={{ fontSize: '.85rem' }}>{log.entity_name || '—'}</td>
                  <td style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
                    {log.field ? `${log.field}: ${log.from_value || '—'} → ${log.to_value || '—'}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
