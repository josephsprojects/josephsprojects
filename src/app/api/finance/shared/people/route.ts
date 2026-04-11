export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PersonSchema = z.object({
  name:  z.string().min(1),
  color: z.string().default('#4F6EF7'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})

export async function GET() {
  const user = await requireAuth()
  const people = await prisma.financePerson.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'asc' } })
  return NextResponse.json({ success: true, data: people })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const parsed = PersonSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  const person = await prisma.financePerson.create({ data: { ...parsed.data, user_id: user.id } })
  return NextResponse.json({ success: true, data: person }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  const parsed = PersonSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 })
  await prisma.financePerson.updateMany({ where: { id, user_id: user.id }, data: parsed.data })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 })
  await prisma.financePerson.deleteMany({ where: { id, user_id: user.id } })
  return NextResponse.json({ success: true })
}
