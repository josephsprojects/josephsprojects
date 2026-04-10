import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import WorkspacesClient from './WorkspacesClient'

export const metadata = { title: 'Workspaces' }

export default async function WorkspacesPage() {
  await requireOwner()
  const workspaces = await prisma.workspace.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { patients: true, members: true } } }
  })
  return <WorkspacesClient initialWorkspaces={workspaces as any} />
}
