export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateMedSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().optional(),
  brand: z.string().optional().nullable(),
  generic: z.string().optional().nullable(),
  dosage: z.string().optional().nullable(),
  actual_dose: z.string().optional().nullable(),
  form: z.string().optional(),
  route: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  quantity: z.number().int().optional(),
  days_supply: z.number().int().optional(),
  quantity_home: z.number().int().optional().nullable(),
  pickup_date: z.string().optional().nullable(),
  refills: z.number().int().optional(),
  notify_refill: z.boolean().optional(),
  last_fill: z.string().optional().nullable(),
  next_fill: z.string().optional().nullable(),
  status: z.enum(['active', 'on_hold', 'discontinued', 'archived']).optional(),
  notes: z.string().optional().nullable(),
  provider_id: z.string().optional().nullable(),
  pharmacy_id: z.string().optional().nullable(),
  rxcui: z.string().optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  const { id } = await params
  const body = await req.json()
  const parsed = UpdateMedSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid data', error: parsed.error.message }, { status: 400 })
  }

  const existing = await prisma.medication.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ success: false, message: 'Medication not found' }, { status: 404 })

  const updated = await prisma.medication.update({
    where: { id },
    data: parsed.data,
    include: {
      patient: { select: { name: true, color: true } },
      provider: { select: { name: true } },
      pharmacy: { select: { name: true } },
    },
  })

  // Track meaningful field changes
  const trackFields = ['name', 'status', 'dosage', 'frequency', 'refills', 'days_supply']
  for (const field of trackFields) {
    const oldVal = (existing as any)[field]
    const newVal = (parsed.data as any)[field]
    if (newVal !== undefined && String(oldVal ?? '') !== String(newVal ?? '')) {
      await createAuditLog({
        userId: user.id, userName: user.name,
        workspaceId: existing.workspace_id, action: 'update',
        entityType: 'medication', entityName: existing.name,
        field, fromValue: String(oldVal ?? ''), toValue: String(newVal ?? ''),
      })
    }
  }

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  const { id } = await params

  const existing = await prisma.medication.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ success: false, message: 'Medication not found' }, { status: 404 })

  await prisma.medication.delete({ where: { id } })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: existing.workspace_id, action: 'delete',
    entityType: 'medication', entityName: existing.name,
  })

  return NextResponse.json({ success: true })
}
