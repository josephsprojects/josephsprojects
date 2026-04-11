import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MessagesClient from './MessagesClient'

export const metadata = { title: 'Messages' }

export default async function MessagesPage() {
  const user = await requireOwner()

  const [messages, workspaces, allUsers, patients] = await Promise.all([
    prisma.message.findMany({
      where: { OR: [{ sender_id: user.id }, { recipient_id: user.id }] },
      orderBy: { created_at: 'desc' },
      take: 100,
      include: {
        sender:    { select: { name: true } },
        recipient: { select: { name: true } },
      },
    }),
    prisma.workspace.findMany({ where: { status: 'active' }, select: { id: true } }),
    prisma.user.findMany({
      where: { status: 'active', id: { not: user.id } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.patient.findMany({
      where: { status: 'active' },
      select: {
        id: true, name: true,
        medications: {
          where: { status: { in: ['active', 'on_hold'] } },
          select: {
            id: true, name: true, brand: true, status: true,
            provider: { select: { id: true, name: true, phone: true, fax: true, email: true, specialty: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  const workspaceId = workspaces[0]?.id || ''

  return (
    <MessagesClient
      initialMessages={messages as any}
      currentUserId={user.id}
      workspaceId={workspaceId}
      members={allUsers}
      patients={patients as any}
    />
  )
}
