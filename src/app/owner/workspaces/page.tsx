import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import WorkspacesClient from './WorkspacesClient'

export const metadata = { title: 'Workspaces' }

export const dynamic = 'force-dynamic'

export default async function WorkspacesPage() {
  await requireOwner()
  const cookieStore = await cookies()
  const isTestMode = cookieStore.get('curalog_test_mode')?.value === '1'

  const workspaces = await prisma.workspace.findMany({
    where: { is_test: isTestMode },
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { patients: true, members: true } } }
  })
  return <WorkspacesClient initialWorkspaces={workspaces as any} />
}
