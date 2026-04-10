import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RequestsClient from './RequestsClient'

export const metadata = { title: 'Refill Requests' }

export default async function RequestsPage() {
  await requireOwner()
  const [requests, patients] = await Promise.all([
    prisma.refillRequest.findMany({
      orderBy: { created_at: 'desc' },
      include: { patient: { select: { name: true, color: true } } }
    }),
    prisma.patient.findMany({ where: { status: 'active' }, select: { id: true, name: true, workspace_id: true } })
  ])
  return <RequestsClient initialRequests={requests as any} patients={patients} />
}
