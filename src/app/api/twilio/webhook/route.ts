export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSMS, formatPhone } from '@/lib/twilio'

// Twilio sends application/x-www-form-urlencoded
export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const fromRaw = params.get('From') || ''
  const msgBody = (params.get('Body') || '').trim().toUpperCase()

  // Find patient by phone number (try various formats)
  const digits = fromRaw.replace(/\D/g, '')
  const patients = await prisma.patient.findMany({
    where: { phone: { not: null } },
    select: { id: true, name: true, phone: true, workspace_id: true },
  })
  const patient = patients.find(p => {
    const pd = (p.phone || '').replace(/\D/g, '')
    return pd === digits || pd === digits.slice(-10) || digits === pd.slice(-10)
  })

  if (!patient) {
    // Unknown sender — acknowledge and exit
    return twiml('')
  }

  // Find the most recent unread SMS refill reminder for this patient
  const pendingNotif = await prisma.notification.findFirst({
    where: { patient_id: patient.id, type: 'sms_refill_sent', status: 'unread' },
    orderBy: { created_at: 'desc' },
  })

  const medicationId = pendingNotif?.link
  const medication = medicationId
    ? await prisma.medication.findUnique({ where: { id: medicationId }, select: { id: true, name: true, brand: true, workspace_id: true } })
    : null
  const medName = medication ? (medication.brand || medication.name) : 'your medication'

  if (msgBody.startsWith('YES') || msgBody === 'Y') {
    // Create a refill request
    if (medication) {
      await prisma.refillRequest.create({
        data: {
          workspace_id: medication.workspace_id,
          patient_id: patient.id,
          medication_id: medication.id,
          method: 'sms',
          notes: `Patient replied YES via SMS to refill reminder for ${medName}`,
          status: 'pending',
        }
      })
    }

    // Notify the owner
    await prisma.notification.create({
      data: {
        workspace_id: patient.workspace_id,
        patient_id: patient.id,
        type: 'sms_reply_yes',
        title: `${patient.name} needs a refill — ${medName}`,
        message: `${patient.name} replied YES via SMS. A refill request has been created.`,
        link: medicationId || null,
        status: 'unread',
        color: 'yellow',
      }
    })

    // Mark pending notification as read
    if (pendingNotif) {
      await prisma.notification.update({ where: { id: pendingNotif.id }, data: { status: 'read' } })
    }

    // Confirm to patient
    await sendSMS(fromRaw, `Got it! Your refill request for ${medName} has been submitted. Your care manager will follow up shortly.`)
    return twiml('')
  }

  if (msgBody.startsWith('NO') || msgBody === 'N') {
    // Notify owner that patient declined
    await prisma.notification.create({
      data: {
        workspace_id: patient.workspace_id,
        patient_id: patient.id,
        type: 'sms_reply_no',
        title: `${patient.name} does not need a refill — ${medName}`,
        message: `${patient.name} replied NO via SMS. No refill needed at this time.`,
        link: medicationId || null,
        status: 'unread',
        color: 'green',
      }
    })

    // Mark pending notification as read
    if (pendingNotif) {
      await prisma.notification.update({ where: { id: pendingNotif.id }, data: { status: 'read' } })
    }

    await sendSMS(fromRaw, `Understood! No refill needed for ${medName} right now. We'll check in again soon.`)
    return twiml('')
  }

  // Unknown reply
  await sendSMS(fromRaw, `CuraLog: Please reply YES to request a refill for ${medName} or NO to dismiss.`)
  return twiml('')
}

function twiml(msg: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response>${msg ? `<Message>${msg}</Message>` : ''}</Response>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } })
}
