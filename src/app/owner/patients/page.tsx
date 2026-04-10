import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PatientsClient from './PatientsClient'

export const metadata = { title: 'Patients' }

export default async function PatientsPage() {
  await requireOwner()
  const [patients, workspaces] = await Promise.all([
    prisma.patient.findMany({
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { medications: true } }, workspace: { select: { name: true } } }
    }),
    prisma.workspace.findMany({ where: { status: 'active' }, select: { id: true, name: true } })
  ])
  return <PatientsClient initialPatients={patients as any} workspaces={workspaces} />
}
