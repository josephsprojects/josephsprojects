export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createAuditLog } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  await createAuditLog({ userId: user.id, userName: user.name, ...body })
  return NextResponse.json({ success: true })
}
