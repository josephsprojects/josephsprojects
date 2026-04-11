import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AuditClient from './AuditClient'

export const metadata = { title: 'Audit Log' }

export default async function AuditPage() {
  await requireOwner()
  const logs = await prisma.auditLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 500,
  })
  return <AuditClient initialLogs={logs as any} />
}
