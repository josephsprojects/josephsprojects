export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ExpenseSchema = z.object({
  name:   z.string().min(1),
  total:  z.number().min(0),
  date:   z.string().optional(),
  notes:  z.string().optional(),
  splits: z.array(z.object({ person_id: z.string(), amount: z.number(), paid: z.boolean().default(false) })).optional(),
})

export async function GET() {
  const user = await requireAuth()
  const expenses = await prisma.sharedExpense.findMany({
    where: { user_id: user.id },
    orderBy: { date: 'desc' },
    include: { splits: { include: { person: true } } },
  })
  return NextResponse.json({ success: true, data: expenses })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const parsed = ExpenseSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const { splits, date, ...rest } = parsed.data
  const expense = await prisma.sharedExpense.create({
    data: {
      ...rest,
      user_id: user.id,
      date: date ? new Date(date) : new Date(),
      splits: splits ? { create: splits } : undefined,
    },
    include: { splits: { include: { person: true } } },
  })
  return NextResponse.json({ success: true, data: expense }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  const parsed = ExpenseSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const { splits, date, ...rest } = parsed.data
  await prisma.sharedExpense.updateMany({ where: { id, user_id: user.id }, data: { ...rest, ...(date ? { date: new Date(date) } : {}) } })
  if (splits) {
    await prisma.sharedExpenseSplit.deleteMany({ where: { expense_id: id } })
    await prisma.sharedExpenseSplit.createMany({ data: splits.map(s => ({ ...s, expense_id: id })) })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  await prisma.sharedExpense.deleteMany({ where: { id, user_id: user.id } })
  return NextResponse.json({ success: true })
}
