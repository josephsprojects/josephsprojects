import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const CreatePatientSchema = z.object({
  workspace_id: z.string(),
  name: z.string().min(1).max(150),
  dob: z.string().optional(),
  relationship: z.string().optional(),
  allergies: z.string().default('None known'),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().default('#0E4F54'),
})

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  const wsId = req.nextUrl.searchParams.get('workspace_id')

  const where = user.role === 'platform_owner'
    ? (wsId ? { workspace_id: wsId } : {})
    : { workspace_id: wsId || '' }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { medications: true } } }
  })
  return NextResponse.json<ApiResponse>({ success: true, data: patients })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const parsed = CreatePatientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })
  }

  const initials = parsed.data.name.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()
  const patient = await prisma.patient.create({
    data: { ...parsed.data, initials }
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: parsed.data.workspace_id, action: 'create',
    entityType: 'patient', entityName: patient.name,
  })

  return NextResponse.json<ApiResponse>({ success: true, data: patient }, { status: 201 })
}
