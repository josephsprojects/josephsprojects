export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { sendEmail } from '@/lib/sendgrid'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const ALL_STATUSES = [
  'pending','sent_to_prescriber','submitted','at_prescriber',
  'prescriber_approved','prescriber_denied','sent_to_pharmacy','at_pharmacy',
  'prior_auth_required','prior_auth_submitted','prior_auth_approved','prior_auth_denied',
  'too_soon','insurance_issue','delay','ready','picked_up','denied','cancelled',
] as const

// Patient-friendly messages for each status
const PATIENT_MSG: Record<string, string> = {
  pending:               'Your refill request has been received.',
  sent_to_prescriber:    'Your refill request has been sent to your prescriber.',
  submitted:             'Your refill request has been submitted.',
  at_prescriber:         'Your prescriber is reviewing your refill request.',
  prescriber_approved:   'Great news — your prescriber approved the refill! It\'s being sent to your pharmacy.',
  prescriber_denied:     'Your prescriber was unable to approve this refill. Please contact your care team.',
  sent_to_pharmacy:      'Your prescription has been sent to the pharmacy.',
  at_pharmacy:           'Your pharmacy has received the prescription and is processing it.',
  prior_auth_required:   'Your insurance requires prior authorization. We\'re working on it.',
  prior_auth_submitted:  'Prior authorization has been submitted to your insurance company. We\'ll update you when we hear back.',
  prior_auth_approved:   'Prior authorization approved! Your pharmacy will now fill the prescription.',
  prior_auth_denied:     'Prior authorization was denied. Please contact your care team for next steps.',
  too_soon:              'It\'s too early to refill based on your insurance plan. We\'ll try again when eligible.',
  insurance_issue:       'There\'s an issue with your insurance coverage. We\'re working to resolve it.',
  delay:                 'There\'s a delay with your refill. We\'re working to resolve it.',
  ready:                 'Your prescription is ready for pickup!',
  picked_up:             'Your prescription has been picked up. Take care!',
  denied:                'This refill request was not approved. Please contact your care team.',
  cancelled:             'This refill request has been cancelled.',
}

const CreateRRSchema = z.object({
  workspace_id:  z.string(),
  patient_id:    z.string(),
  medication_id: z.string().optional(),
  method:        z.string().default('electronic'),
  notes:         z.string().optional(),
})

const UpdateRRSchema = z.object({
  status:         z.enum(ALL_STATUSES),
  status_note:    z.string().optional(),
  notify_patient: z.boolean().optional(),
})

const OWNER_EMAIL = process.env.OWNER_EMAIL || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dataprimetech.com'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  const p = req.nextUrl.searchParams
  const requests = await prisma.refillRequest.findMany({
    where: {
      workspace_id: p.get('workspace_id') || undefined,
      patient_id:   p.get('patient_id')   || undefined,
      status:       (p.get('status') as any) || undefined,
    },
    orderBy: { created_at: 'desc' },
    include: {
      patient:    { select: { name: true, color: true, phone: true, email: true } },
      medication: { select: { name: true } },
    },
  })
  return NextResponse.json<ApiResponse>({ success: true, data: requests })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const parsed = CreateRRSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })

  const [patient, medication] = await Promise.all([
    prisma.patient.findUnique({ where: { id: parsed.data.patient_id }, select: { name: true, phone: true, email: true } }),
    parsed.data.medication_id
      ? prisma.medication.findUnique({ where: { id: parsed.data.medication_id }, select: { name: true } })
      : null,
  ])

  const rr = await prisma.refillRequest.create({
    data: {
      ...parsed.data,
      requested_by:   user.id,
      status_history: [{ status: 'pending', at: new Date().toISOString(), by: user.name }],
    },
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: parsed.data.workspace_id, action: 'create',
    entityType: 'refill_request', entityName: `Request ${rr.id.slice(-6)}`,
    toValue: 'pending',
  })

  // Notify owner
  if (OWNER_EMAIL && patient && medication) {
    sendEmail({
      to: OWNER_EMAIL,
      subject: `New refill request — ${patient.name} · ${medication.name}`,
      html: refillEmailHtml('New Refill Request', patient.name, medication.name, 'pending', null, APP_URL),
    }).catch(() => {})
  }

  return NextResponse.json<ApiResponse>({ success: true, data: rr }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const parsed = UpdateRRSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid status' }, { status: 400 })

  const existing = await prisma.refillRequest.findUnique({
    where: { id },
    include: {
      patient:    { select: { name: true, phone: true, email: true } },
      medication: { select: { name: true } },
    },
  })
  if (!existing) return NextResponse.json<ApiResponse>({ success: false, message: 'Not found' }, { status: 404 })

  const history = Array.isArray(existing.status_history) ? existing.status_history as any[] : []
  history.push({
    status: parsed.data.status,
    note:   parsed.data.status_note || null,
    at:     new Date().toISOString(),
    by:     user.name,
  })

  const updated = await prisma.refillRequest.update({
    where: { id },
    data: {
      status:         parsed.data.status as any,
      status_note:    parsed.data.status_note || null,
      status_history: history,
    },
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: existing.workspace_id, action: 'update',
    entityType: 'refill_request', field: 'status',
    fromValue: existing.status, toValue: parsed.data.status,
  })

  // Notify patient if requested or for key statuses
  const { patient, medication } = existing
  const shouldNotify = parsed.data.notify_patient ??
    ['prescriber_approved','prescriber_denied','prior_auth_required','prior_auth_approved','prior_auth_denied','too_soon','ready','denied'].includes(parsed.data.status)

  if (shouldNotify && patient?.email && medication) {
    sendEmail({
      to: patient.email,
      subject: `CuraLog — ${medication.name} refill update`,
      html: refillEmailHtml('Refill Status Update', patient.name, medication.name, parsed.data.status, parsed.data.status_note || null, APP_URL),
    }).catch(() => {})
  }

  return NextResponse.json<ApiResponse>({ success: true, data: updated })
}

function refillEmailHtml(title: string, patientName: string, medName: string, status: string, note: string | null, appUrl: string) {
  const msg = PATIENT_MSG[status] || status.replace(/_/g, ' ')
  const isReady = status === 'ready'
  const isDenied = ['denied','prescriber_denied','prior_auth_denied'].includes(status)
  const accentColor = isReady ? '#059669' : isDenied ? '#dc2626' : '#0d9488'

  return `
    <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:${accentColor};color:#fff;padding:24px 28px">
        <div style="font-weight:800;font-size:1.1rem">CuraLog</div>
        <div style="font-size:.85rem;opacity:.85;margin-top:2px">${title}</div>
      </div>
      <div style="padding:28px">
        <p style="color:#111827;font-weight:600;font-size:1rem;margin:0 0 6px">Hi ${patientName}!</p>
        <p style="color:#4b5563;font-size:.875rem;margin:0 0 18px">Here's an update on your refill request for <strong>${medName}</strong>:</p>
        <div style="background:${isReady?'#f0fdf4':isDenied?'#fef2f2':'#f0fdf4'};border:1px solid ${isReady?'#bbf7d0':isDenied?'#fecaca':'#bbf7d0'};border-radius:10px;padding:16px 18px;margin-bottom:18px">
          <div style="font-size:.95rem;color:#111827;font-weight:600">${msg}</div>
          ${note ? `<div style="margin-top:10px;font-size:.82rem;color:#4b5563;border-top:1px solid rgba(0,0,0,.08);padding-top:10px">Note: ${note}</div>` : ''}
        </div>
        <p style="color:#9ca3af;font-size:.75rem;margin:0">Questions? Contact your care team through CuraLog.</p>
      </div>
    </div>`
}
