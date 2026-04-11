import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import RequestsClient from './RequestsClient'

export const metadata = { title: 'Refill Requests' }

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  await requireOwner()
  const cookieStore = await cookies()
  const isTestMode = cookieStore.get('curalog_test_mode')?.value === '1'

  const [requests, patients, medications] = await Promise.all([
    prisma.refillRequest.findMany({
      where: { workspace: { is_test: isTestMode } },
      orderBy: { created_at: 'desc' },
      include: {
        patient: { select: { name: true, color: true } },
        medication: { select: { name: true } },
      }
    }),
    prisma.patient.findMany({
      where: { status: 'active', workspace: { is_test: isTestMode } },
      select: { id: true, name: true, workspace_id: true }
    }),
    prisma.medication.findMany({
      where: { status: { in: ['active', 'on_hold'] }, workspace: { is_test: isTestMode } },
      select: { id: true, name: true, patient_id: true },
      orderBy: { name: 'asc' },
    }),
  ])
  return <RequestsClient initialRequests={requests as any} patients={patients} medications={medications} />
}
