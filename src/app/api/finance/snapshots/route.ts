export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SnapshotSchema = z.object({
  label:       z.string().optional(),
  net_worth:   z.number(),
  total_debt:  z.number(),
  total_credit: z.number(),
  utilization: z.number(),
  data:        z.any(),
})

export async function GET() {
  const user = await requireAuth()
  const snapshots = await prisma.financeSnapshot.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    take: 24,
  })
  return NextResponse.json({ success: true, data: snapshots })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const parsed = SnapshotSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const snapshot = await prisma.financeSnapshot.create({ data: { ...parsed.data, user_id: user.id } })
  return NextResponse.json({ success: true, data: snapshot }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  await prisma.financeSnapshot.deleteMany({ where: { id, user_id: user.id } })
  return NextResponse.json({ success: true })
}
