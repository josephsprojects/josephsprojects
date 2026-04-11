import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import PatientsClient from './PatientsClient'

export const metadata = { title: 'Patients' }

export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
  await requireOwner()
  const cookieStore = await cookies()
  const isTestMode = cookieStore.get('curalog_test_mode')?.value === '1'

  const [patients, workspaces] = await Promise.all([
    prisma.patient.findMany({
      where: { workspace: { is_test: isTestMode } },
      orderBy: { created_at: 'desc' },
      select: {
        id: true, workspace_id: true, name: true, dob: true, relationship: true,
        phone: true, email: true, allergies: true, emergency_name: true,
        emergency_phone: true, notes: true, color: true, status: true, share_code: true,
        _count: { select: { medications: true } },
        workspace: { select: { name: true } }
      }
    }),
    prisma.workspace.findMany({ where: { status: 'active', is_test: isTestMode }, select: { id: true, name: true } })
  ])
  return <PatientsClient initialPatients={patients as any} workspaces={workspaces} />
}
