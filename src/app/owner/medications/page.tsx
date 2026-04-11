import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import MedicationsClient from './MedicationsClient'

export const metadata = { title: 'Medications' }

export const dynamic = 'force-dynamic'

export default async function MedicationsPage() {
  await requireOwner()
  const cookieStore = await cookies()
  const isTestMode = cookieStore.get('curalog_test_mode')?.value === '1'

  const [medications, patients] = await Promise.all([
    prisma.medication.findMany({
      where: { workspace: { is_test: isTestMode } },
      orderBy: { created_at: 'desc' },
      include: {
        patient: { select: { name: true, color: true, phone: true, email: true } },
        provider: { select: { name: true } },
        pharmacy:  { select: { name: true } },
      }
    }),
    prisma.patient.findMany({
      where: { status: 'active', workspace: { is_test: isTestMode } },
      select: { id: true, name: true, workspace_id: true }
    }),
  ])
  return <MedicationsClient initialMeds={medications as any} patients={patients} />
}
