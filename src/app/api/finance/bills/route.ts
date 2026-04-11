export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const BillSchema = z.object({
  name:      z.string().min(1),
  amount:    z.number().min(0),
  due_day:   z.number().min(1).max(31).optional().nullable(),
  category:  z.string().optional(),
  auto_pay:  z.boolean().default(false),
  notes:     z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function GET() {
  const user = await requireAuth()
  const bills = await prisma.bill.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'asc' } })
  return NextResponse.json({ success: true, data: bills })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const parsed = BillSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const bill = await prisma.bill.create({ data: { ...parsed.data, user_id: user.id } })
  return NextResponse.json({ success: true, data: bill }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  const parsed = BillSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  await prisma.bill.updateMany({ where: { id, user_id: user.id }, data: parsed.data })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  await prisma.bill.deleteMany({ where: { id, user_id: user.id } })
  return NextResponse.json({ success: true })
}
