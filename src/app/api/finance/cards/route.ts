export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CardSchema = z.object({
  name:         z.string().min(1),
  bank:         z.string().optional(),
  last4:        z.string().max(4).optional(),
  limit:        z.number().min(0).default(0),
  balance:      z.number().min(0).default(0),
  apr:          z.number().min(0).default(0),
  due_day:      z.number().min(1).max(31).optional().nullable(),
  min_payment:  z.number().optional().nullable(),
  rewards_type: z.string().optional(),
  rewards_rate: z.number().optional().nullable(),
  color:        z.string().default('#4F6EF7'),
  notes:        z.string().optional(),
  is_closed:    z.boolean().default(false),
})

export async function GET() {
  const user = await requireAuth()
  const cards = await prisma.creditCard.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'asc' },
  })
  return NextResponse.json({ success: true, data: cards })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const parsed = CardSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const card = await prisma.creditCard.create({ data: { ...parsed.data, user_id: user.id } })
  return NextResponse.json({ success: true, data: card }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  const parsed = CardSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const card = await prisma.creditCard.updateMany({ where: { id, user_id: user.id }, data: parsed.data })
  return NextResponse.json({ success: true, data: card })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  await prisma.creditCard.deleteMany({ where: { id, user_id: user.id } })
  return NextResponse.json({ success: true })
}
