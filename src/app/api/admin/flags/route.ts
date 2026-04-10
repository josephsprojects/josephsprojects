export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner, createAuditLog } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await requireOwner()
  const { key, enabled } = await req.json()
  if (!key) return NextResponse.json({ success: false, message: 'Key required' }, { status: 400 })

  const flag = await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled },
    create: { key, name: key, enabled }
  })

  await createAuditLog({
    userId: user.id, userName: user.name, action: 'update',
    entityType: 'feature_flag', entityName: key,
    field: 'enabled', fromValue: String(!enabled), toValue: String(enabled)
  })

  return NextResponse.json({ success: true, data: flag })
}
