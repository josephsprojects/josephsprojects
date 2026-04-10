export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

const UpdatePatientSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  dob: z.string().optional(),
  relationship: z.string().optional(),
  allergies: z.string().optional(),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
}).strict()

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const parsed = UpdatePatientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Invalid data' }, { status: 400 })
  }

  const existing = await prisma.patient.findUnique({ where: { id } })
  if (!existing) return NextResponse.json<ApiResponse>({ success: false, message: 'Not found' }, { status: 404 })

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.name && {
        initials: parsed.data.name.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(),
      }),
    },
  })

  await createAuditLog({
    userId: user.id, userName: user.name,
    workspaceId: patient.workspace_id, action: 'update',
    entityType: 'patient', entityName: patient.name,
  })

  return NextResponse.json<ApiResponse>({ success: true, data: patient })
}
