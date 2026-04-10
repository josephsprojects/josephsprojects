import { requireOwner } from '@/lib/auth'
import Sidebar from '@/components/owner/Sidebar'
import { prisma } from '@/lib/prisma'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner()

  const [pendingRR, unreadNotifs, unreadMsgs] = await Promise.all([
    prisma.refillRequest.count({ where: { status: { in: ['pending', 'submitted'] } } }),
    prisma.notification.count({ where: { status: 'unread' } }),
    prisma.message.count({ where: { status: 'unread' } }),
  ])

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
