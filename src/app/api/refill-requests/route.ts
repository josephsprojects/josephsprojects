export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, refillRequestedEmail, refillStatusEmail } from '@/services/email'
import { sendSMS, refillReadySMS, refillSubmittedSMS } from '@/services/sms'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const CreateRRSchema = z.object({
  workspace_id: z.string(),
  patient_id: z.string(),
  medication_id: z.string().optional(),
  method: z.string().default('electronic'),
  notes: z.string().optional(),
})

const UpdateRRSchema = z.object({
  status: z.enum(['pending','submitted','at_prescriber','at_pharmacy','ready','picked_up','denied']),
  notes: z.string().optional(),
})

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'joseph@dataprimetech.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://curalog.dataprimetech.com'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  const p = req.nextUrl.searchParams

  const requests = await prisma.refillRequest.findMany({
    where: {
      workspace_id: p.get('workspace_id') || undefined,
      patient_id: p.get('patient_id') || undefined,
      status: (p.get('status') as any) || undefined,
    },
    orderBy: { created_at: 'desc' },
    include: {
      patient: { select: { name: true, color: true } },
    }
  })
  return NextResponse.json<ApiResponse>({ success: true, data: requests })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const parsed = CreateRRSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })
  }

  // Fetch patient + medication for notification context
  const [patient, medication] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: parsed.data.patient_id },
      select: { name: true, emergency_phone: true },
    }),
    parsed.data.medication_id
      ? prisma.medication.findUnique({
          where: { id: parsed.data.medication_id },
          select: { name: true },
        })
      : Promise.resolve(null),
  ])

  const rr = await prisma.refillRequest.create({
    data: {
      ...parsed.data,
      requested_by: user.id,
      status_history: [{ status: 'pending', at: new Date().toISOString(), by: user.name }],
    }
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: parsed.data.workspace_id, action: 'create',
    entityType: 'refill_request', entityName: `Request ${rr.id.slice(-6)}`,
    toValue: 'pending',
  })

  // Notify owner by email
  if (patient && medication) {
    sendEmail({
      to: OWNER_EMAIL,
      subject: `New refill request — ${patient.name} · ${medication.name}`,
      html: refillRequestedEmail(patient.name, medication.name, user.name, APP_URL),
    }).catch(e => console.error('Refill email error:', e))

    // SMS emergency contact to confirm request submitted
    if (patient.emergency_phone) {
      sendSMS({
        to: patient.emergency_phone,
        body: refillSubmittedSMS(patient.name, medication.name),
      }).catch(e => console.error('Refill SMS error:', e))
    }
  }

  return NextResponse.json<ApiResponse>({ success: true, data: rr }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const parsed = UpdateRRSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })

  const existing = await prisma.refillRequest.findUnique({
    where: { id },
    include: {
      patient: { select: { name: true, emergency_phone: true } },
      medication: { select: { name: true } },
    },
  })
  if (!existing) return NextResponse.json<ApiResponse>({ success: false, message: 'Not found' }, { status: 404 })

  const history = Array.isArray(existing.status_history) ? existing.status_history as any[] : []
  history.push({ status: parsed.data.status, at: new Date().toISOString(), by: user.name })

  const updated = await prisma.refillRequest.update({
    where: { id },
    data: { status: parsed.data.status as any, status_history: history, notes: parsed.data.notes }
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: existing.workspace_id, action: 'update',
    entityType: 'refill_request', field: 'status',
    fromValue: existing.status, toValue: parsed.data.status,
  })

  const { patient, medication } = existing
  const statusChanged = existing.status !== parsed.data.status

  if (statusChanged && patient && medication) {
    const notifyStatuses = ['submitted', 'at_pharmacy', 'ready', 'denied']

    if (notifyStatuses.includes(parsed.data.status)) {
      // Email owner on meaningful status changes
      sendEmail({
        to: OWNER_EMAIL,
        subject: `Refill update — ${patient.name} · ${medication.name}: ${parsed.data.status.replace(/_/g, ' ')}`,
        html: refillStatusEmail(patient.name, medication.name, parsed.data.status, APP_URL),
      }).catch(e => console.error('Status email error:', e))
    }

    // SMS emergency contact when prescription is ready
    if (parsed.data.status === 'ready' && patient.emergency_phone) {
      sendSMS({
        to: patient.emergency_phone,
        body: refillReadySMS(patient.name, medication.name),
      }).catch(e => console.error('Ready SMS error:', e))
    }
  }

  return NextResponse.json<ApiResponse>({ success: true, data: updated })
}
