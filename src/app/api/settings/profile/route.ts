import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ success: false, message: 'Name required' }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { name: name.trim() } })
  await createAuditLog({ userId: user.id, userName: name, action: 'update', entityType: 'account', entityName: 'Profile', field: 'name', fromValue: user.name, toValue: name.trim() })

  return NextResponse.json({ success: true })
}
