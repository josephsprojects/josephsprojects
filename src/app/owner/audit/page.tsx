import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Audit Log' }

export default async function AuditPage() {
  await requireOwner()
  const logs = await prisma.auditLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 200,
  })

  const ACTION_COLORS: Record<string,string> = { create:'badge-teal',update:'badge-blue',delete:'badge-red',login:'badge-gray',logout:'badge-gray',approve:'badge-green',deny:'badge-red',upload:'badge-purple',invite:'badge-amber' }

  return (
    <div className="pg-inner">
      <div className="pg-hd"><h2>Audit Log</h2><p>Complete record of all platform actions</p></div>
      <div className="crd" style={{ padding: 0 }}>
        {logs.length === 0 ? (
          <div className="empty-state"><h3>No audit entries yet</h3><p>Actions you and your team take will appear here.</p></div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Type</th><th>Entity</th><th>Change</th></tr></thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '.75rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{log.user_name || 'System'}</td>
                  <td><span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`}>{log.action}</span></td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{log.entity_type}</td>
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
