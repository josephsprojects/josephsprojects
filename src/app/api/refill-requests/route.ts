import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  return NextResponse.json<ApiResponse>({ success: true, data: rr }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const parsed = UpdateRRSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })

  const existing = await prisma.refillRequest.findUnique({ where: { id } })
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

  return NextResponse.json<ApiResponse>({ success: true, data: updated })
}
