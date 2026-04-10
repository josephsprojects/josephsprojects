import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MedicationsClient from './MedicationsClient'

export const metadata = { title: 'Medications' }

export default async function MedicationsPage() {
  await requireOwner()
  const [medications, patients, workspaces] = await Promise.all([
    prisma.medication.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        patient: { select: { name: true, color: true } },
        provider: { select: { name: true } },
        pharmacy: { select: { name: true } },
      }
    }),
    prisma.patient.findMany({ where: { status: 'active' }, select: { id: true, name: true, workspace_id: true } }),
    prisma.workspace.findMany({ where: { status: 'active' }, select: { id: true, name: true } }),
  ])
  return <MedicationsClient initialMeds={medications as any} patients={patients} workspaces={workspaces} />
}
