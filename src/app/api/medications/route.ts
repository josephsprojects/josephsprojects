import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const CreateMedSchema = z.object({
  workspace_id: z.string(),
  patient_id: z.string(),
  name: z.string().min(1),
  generic: z.string().optional(),
  dosage: z.string().optional(),
  actual_dose: z.string().optional(),
  form: z.string().default('Tablet'),
  route: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
  purpose: z.string().optional(),
  quantity: z.number().int().default(30),
  days_supply: z.number().int().default(30),
  refills: z.number().int().default(0),
  last_fill: z.string().optional(),
  provider_id: z.string().optional(),
  pharmacy_id: z.string().optional(),
  rxcui: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  const p = req.nextUrl.searchParams

  const medications = await prisma.medication.findMany({
    where: {
      workspace_id: p.get('workspace_id') || undefined,
      patient_id: p.get('patient_id') || undefined,
      status: (p.get('status') as any) || undefined,
    },
    orderBy: { created_at: 'desc' },
    include: {
      patient: { select: { name: true, color: true } },
      provider: { select: { name: true, specialty: true } },
      pharmacy: { select: { name: true, address: true } },
    }
  })
  return NextResponse.json<ApiResponse>({ success: true, data: medications })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const parsed = CreateMedSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data', error: parsed.error.message }, { status: 400 })
  }

  const med = await prisma.medication.create({ data: parsed.data })

  // Low supply notification
  if (parsed.data.days_supply <= 7) {
    const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patient_id } })
    await prisma.notification.create({
      data: {
        workspace_id: parsed.data.workspace_id,
        patient_id: parsed.data.patient_id,
        type: 'refill_due',
        title: `${parsed.data.name} — low supply`,
        message: `${patient?.name || 'Patient'} · ${parsed.data.days_supply} days supply remaining`,
        color: 'yellow',
      }
    })
  }

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: parsed.data.workspace_id, action: 'create',
    entityType: 'medication', entityName: med.name,
    toValue: 'active',
  })

  return NextResponse.json<ApiResponse>({ success: true, data: med }, { status: 201 })
}
