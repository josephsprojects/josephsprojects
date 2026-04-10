import { requireOwner } from '@/lib/auth'
import Sidebar from '@/components/owner/Sidebar'
import { prisma } from '@/lib/prisma'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  let user: any, pendingRR = 0, unreadNotifs = 0, unreadMsgs = 0
  try {
    user = await requireOwner()
    ;[pendingRR, unreadNotifs, unreadMsgs] = await Promise.all([
      prisma.refillRequest.count({ where: { status: { in: ['pending', 'submitted'] } } }),
      prisma.notification.count({ where: { status: 'unread' } }),
      prisma.message.count({ where: { status: 'unread' } }),
    ])
  } catch (e: any) {
    if (isRedirectError(e)) throw e  // let Next.js handle redirects normally
    const dbUrl = process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@') ?? 'NOT SET'
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 13 }}>
        <strong style={{ color: 'red' }}>Error:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{e?.message ?? String(e)}</pre>
        <p style={{ color: '#666' }}>DB URL (masked): {dbUrl}</p>
      </div>
    )
  }

  const initials = user.name.split(' ').map((x: any) => x[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="pg-wrap">
      <Sidebar
        userName={user.name}
        userInitials={initials}
        userRole={user.role}
        badges={{
          'Refill Requests': pendingRR,
          'Notifications': unreadNotifs,
          'Messages': unreadMsgs,
        }}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
