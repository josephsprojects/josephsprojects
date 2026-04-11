export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, refillReminderHtml } from '@/lib/sendgrid'
import type { ApiResponse } from '@/types'

// POST /api/notifications/email
// Body: { patientId, medicationId }
export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const { patientId, medicationId } = await req.json()

  if (!patientId || !medicationId) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'patientId and medicationId required' }, { status: 400 })
  }

  const [patient, medication] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, name: true, email: true, workspace_id: true } }),
    prisma.medication.findUnique({ where: { id: medicationId }, select: { id: true, name: true, brand: true, dosage: true, instructions: true, days_supply: true, pickup_date: true, last_fill: true } }),
  ])

  if (!patient) return NextResponse.json<ApiResponse>({ success: false, message: 'Patient not found' }, { status: 404 })
  if (!medication) return NextResponse.json<ApiResponse>({ success: false, message: 'Medication not found' }, { status: 404 })
  if (!patient.email) return NextResponse.json<ApiResponse>({ success: false, message: 'Patient has no email on file' }, { status: 400 })

  const medName = medication.brand || medication.name
  const daysLeft = calcDaysLeft(medication.pickup_date, medication.last_fill, medication.days_supply)
  const ownerName = user.name || 'Your care manager'

  try {
    await sendEmail({
      to: patient.email,
      subject: `Refill reminder: ${medName}`,
      html: refillReminderHtml({
        patientName: patient.name,
        medName,
        daysLeft,
        dosage: medication.dosage || undefined,
        instructions: medication.instructions || undefined,
        ownerName,
      }),
    })
  } catch (e: any) {
    console.error('SendGrid error:', e)
    return NextResponse.json<ApiResponse>({ success: false, message: `Email failed: ${e.message}` }, { status: 500 })
  }

  // Log the notification
  await prisma.notification.create({
    data: {
      workspace_id: patient.workspace_id,
      patient_id: patientId,
      type: 'email_refill_sent',
      title: `Email reminder sent — ${medName}`,
      message: `Reminder emailed to ${patient.email}.`,
      link: medicationId,
      status: 'read',
      color: 'blue',
    }
  })

  return NextResponse.json<ApiResponse>({ success: true, message: 'Email sent' })
}

function calcDaysLeft(pickupDate?: string | null, lastFill?: string | null, daysSupply?: number | null): number | null {
  const base = pickupDate || lastFill
  if (!base || !daysSupply) return null
  return Math.max(0, daysSupply - Math.floor((Date.now() - new Date(base).getTime()) / 86400000))
}
