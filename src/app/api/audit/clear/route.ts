export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  await requireOwner()
  const { before } = await req.json().catch(() => ({}))

  // Optional: only clear logs older than a given date
  const where = before ? { created_at: { lt: new Date(before) } } : {}
  const { count } = await prisma.auditLog.deleteMany({ where })

  return NextResponse.json({ success: true, deleted: count })
}
