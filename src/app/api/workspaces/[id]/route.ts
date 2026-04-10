export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await requireOwner()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })

  const body = await req.json()
  const ws = await prisma.workspace.update({ where: { id }, data: body })

  await createAuditLog({ userId: user.id, userName: user.name, workspaceId: id, action: 'update', entityType: 'workspace', entityName: ws.name })

  return NextResponse.json({ success: true, data: ws })
}
