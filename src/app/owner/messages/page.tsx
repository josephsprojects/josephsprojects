import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Messages' }

export default async function MessagesPage() {
  const user = await requireOwner()
  const messages = await prisma.message.findMany({
    where: { OR: [{ sender_id: user.id }, { recipient_id: user.id }] },
    orderBy: { created_at: 'desc' },
    take: 50,
    include: {
      sender: { select: { name: true } },
      recipient: { select: { name: true } },
    }
  })

  return (
    <div className="pg-inner">
      <div className="pg-hd"><h2>Messages</h2><p>{messages.filter((m: any) => m.status === 'unread' && m.recipient_id === user.id).length} unread</p></div>
      <div className="crd" style={{ padding: 0 }}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <h3>No messages</h3><p>Messages from your care team will appear here.</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'flex-start', background: msg.status === 'unread' && msg.recipient_id === user.id ? 'rgba(14,79,84,.03)' : 'transparent' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.75rem', fontWeight: 700, flexShrink: 0 }}>
                {(msg.sender?.name || 'S').split(' ').map((x: string) => x[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: msg.status === 'unread' ? 700 : 500, fontSize: '.875rem' }}>
                    {msg.sender_id === user.id ? `To: ${msg.recipient?.name || 'Unknown'}` : `From: ${msg.sender?.name || 'Unknown'}`}
                    {msg.subject && <span style={{ fontWeight: 400, color: 'var(--text2)' }}> — {msg.subject}</span>}
                  </div>
                  <span style={{ fontSize: '.72rem', color: 'var(--text3)', flexShrink: 0 }}>{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginTop: 4 }}>{msg.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
