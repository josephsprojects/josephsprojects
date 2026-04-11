import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PortalClient from './PortalClient'

export const dynamic = 'force-dynamic'

export default async function PortalPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const patient = await prisma.patient.findUnique({
    where: { share_code: code.toUpperCase() },
    select: {
      id: true, name: true, dob: true, allergies: true, color: true,
      medications: {
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, brand: true, generic: true, dosage: true,
          form: true, frequency: true, instructions: true, purpose: true,
          status: true, quantity: true, days_supply: true, refills: true,
          quantity_home: true, pickup_date: true, last_fill: true, next_fill: true, type: true,
          provider: { select: { name: true, phone: true, fax: true } },
          pharmacy: { select: { name: true, phone: true, address: true } },
        }
      }
    }
  })

  if (!patient) notFound()

  const refillRequests = await prisma.refillRequest.findMany({
    where: { patient_id: patient.id, status: { notIn: ['picked_up', 'cancelled'] } },
    orderBy: { updated_at: 'desc' },
    select: {
      id: true, status: true, status_note: true, method: true,
      notes: true, created_at: true, updated_at: true, status_history: true,
      medication: { select: { name: true } },
    },
  })

  return <PortalClient patient={patient as any} shareCode={code.toUpperCase()} refillRequests={refillRequests as any} />
}
