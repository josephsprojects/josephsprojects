import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const patient = await prisma.patient.update({ where: { id }, data: body })

  await createAuditLog({ userId: user.id, userName: user.name, workspaceId: patient.workspace_id, action: 'update', entityType: 'patient', entityName: patient.name })

  return NextResponse.json({ success: true, data: patient })
}
