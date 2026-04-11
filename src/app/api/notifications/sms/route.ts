export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSMS, formatPhone } from '@/lib/twilio'
import type { ApiResponse } from '@/types'

// POST /api/notifications/sms
// Body: { patientId, medicationId }
export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const { patientId, medicationId } = await req.json()

  if (!patientId || !medicationId) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'patientId and medicationId required' }, { status: 400 })
  }

  const [patient, medication] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, name: true, phone: true, workspace_id: true } }),
    prisma.medication.findUnique({ where: { id: medicationId }, select: { id: true, name: true, brand: true, dosage: true, days_supply: true, pickup_date: true, last_fill: true } }),
  ])

  if (!patient) return NextResponse.json<ApiResponse>({ success: false, message: 'Patient not found' }, { status: 404 })
  if (!medication) return NextResponse.json<ApiResponse>({ success: false, message: 'Medication not found' }, { status: 404 })
  if (!patient.phone) return NextResponse.json<ApiResponse>({ success: false, message: 'Patient has no phone number on file' }, { status: 400 })

  const medName = medication.brand || medication.name
  const daysLeft = calcDaysLeft(medication.pickup_date, medication.last_fill, medication.days_supply)
  const ownerName = user.name || 'Your care manager'

  const smsBody = `CuraLog: Hi ${patient.name}! Do you need a refill for ${medName}${daysLeft !== null ? ` (${daysLeft} days left)` : ''}? Reply YES to request a refill or NO to dismiss. —${ownerName}`

  try {
    await sendSMS(formatPhone(patient.phone), smsBody)
  } catch (e: any) {
    console.error('Twilio SMS error:', e)
    return NextResponse.json<ApiResponse>({ success: false, message: `SMS failed: ${e.message}` }, { status: 500 })
  }

  // Record the pending SMS so webhook can match the reply
  await prisma.notification.create({
    data: {
      workspace_id: patient.workspace_id,
      patient_id: patientId,
      type: 'sms_refill_sent',
      title: `SMS reminder sent — ${medName}`,
      message: `Reminder sent to ${patient.phone}. Awaiting patient reply.`,
      link: medicationId,   // store medId here so webhook can look it up
      status: 'unread',
      color: 'blue',
    }
  })

  return NextResponse.json<ApiResponse>({ success: true, message: 'SMS sent' })
}

function calcDaysLeft(pickupDate?: string | null, lastFill?: string | null, daysSupply?: number | null): number | null {
  const base = pickupDate || lastFill
  if (!base || !daysSupply) return null
  return Math.max(0, daysSupply - Math.floor((Date.now() - new Date(base).getTime()) / 86400000))
}
