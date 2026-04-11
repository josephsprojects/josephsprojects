import { requireOwner } from '@/lib/auth'
import Sidebar from '@/components/owner/Sidebar'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner()
  const cookieStore = await cookies()
  const isTestMode = cookieStore.get('curalog_test_mode')?.value === '1'

  const wsFilter = { is_test: isTestMode }

  const [pendingRR, unreadNotifs, unreadMsgs] = await Promise.all([
    prisma.refillRequest.count({ where: { status: { in: ['pending', 'submitted'] }, workspace: wsFilter } }),
    prisma.notification.count({ where: { status: 'unread', workspace: wsFilter } }),
    prisma.message.count({ where: { status: 'unread', workspace: wsFilter } }),
  ])

  const initials = user.name.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="pg-wrap">
      <Sidebar
        userName={user.name}
        userInitials={initials}
        userRole={user.role}
        isTestMode={isTestMode}
        badges={{
          'Refill Requests': pendingRR,
          'Notifications': unreadNotifs,
          'Messages': unreadMsgs,
        }}
      />
      <main className="main-content">
        {isTestMode && (
          <div style={{ background: '#fef08a', borderBottom: '1px solid #eab308', padding: '8px 24px', fontSize: '.8rem', fontWeight: 600, color: '#713f12', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
            TEST MODE — You are viewing demo data. Real patient records are hidden.
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
