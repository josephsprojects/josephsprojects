export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SubSchema = z.object({
  name:          z.string().min(1),
  amount:        z.number().min(0),
  billing_cycle: z.enum(['weekly','monthly','yearly']).default('monthly'),
  next_billing:  z.string().optional().nullable(),
  category:      z.string().optional(),
  url:           z.string().optional(),
  notes:         z.string().optional(),
  is_active:     z.boolean().default(true),
})

export async function GET() {
  const user = await requireAuth()
  const subs = await prisma.subscription.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'asc' },
  })
  return NextResponse.json({ success: true, data: subs })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const parsed = SubSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const { next_billing, ...rest } = parsed.data
  const sub = await prisma.subscription.create({
    data: { ...rest, user_id: user.id, next_billing: next_billing ? new Date(next_billing) : null },
  })
  return NextResponse.json({ success: true, data: sub }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  const parsed = SubSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const { next_billing, ...rest } = parsed.data
  await prisma.subscription.updateMany({
    where: { id, user_id: user.id },
    data: { ...rest, ...(next_billing !== undefined ? { next_billing: next_billing ? new Date(next_billing) : null } : {}) },
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  await prisma.subscription.deleteMany({ where: { id, user_id: user.id } })
  return NextResponse.json({ success: true })
}
