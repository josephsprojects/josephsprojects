import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  await requireOwner()
  const notifications = await prisma.notification.findMany({
    orderBy: { created_at: 'desc' },
    take: 100,
    include: { patient: { select: { name: true, color: true } } }
  })

  const COLOR_MAP: Record<string,string> = { yellow:'badge-amber', red:'badge-red', blue:'badge-blue', green:'badge-green', teal:'badge-teal' }

  return (
    <div className="pg-inner">
      <div className="pg-hd">
        <h2>Notifications</h2>
        <p>{notifications.filter(n => n.status === 'unread').length} unread</p>
      </div>
      <div className="crd" style={{ padding: 0 }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            <h3>No notifications</h3><p>You're all caught up.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'flex-start', background: n.status === 'unread' ? 'rgba(14,79,84,.03)' : 'transparent' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.status === 'unread' ? 'var(--teal)' : 'transparent', marginTop: 6, flexShrink: 0, border: '1.5px solid var(--border)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ fontWeight: n.status === 'unread' ? 700 : 500, fontSize: '.875rem' }}>{n.title}</div>
                  <span className={`badge ${COLOR_MAP[n.color] || 'badge-gray'}`} style={{ flexShrink: 0 }}>{n.type.replace(/_/g,' ')}</span>
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: 2 }}>{n.message}</p>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
