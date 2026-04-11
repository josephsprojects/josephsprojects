export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/sendgrid'
import { invoiceEmailHtml } from '@/lib/sendgrid'

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const { person_id, note, due_date } = body

  if (!person_id) {
    return NextResponse.json({ success: false, message: 'person_id required' }, { status: 400 })
  }

  // Fetch person (must belong to this user)
  const person = await prisma.financePerson.findFirst({ where: { id: person_id, user_id: user.id } })
  if (!person) return NextResponse.json({ success: false, message: 'Person not found' }, { status: 404 })
  if (!person.email) return NextResponse.json({ success: false, message: 'Person has no email on file' }, { status: 400 })

  // Fetch all unpaid splits for this person
  const splits = await prisma.sharedExpenseSplit.findMany({
    where: { person_id, paid: false },
    include: { expense: true },
    orderBy: { expense: { date: 'desc' } },
  })

  if (splits.length === 0) {
    return NextResponse.json({ success: false, message: 'No unpaid items to invoice' }, { status: 400 })
  }

  const total = splits.reduce((s, sp) => s + sp.amount, 0)
  const items = splits.map(sp => ({ name: sp.expense.name, date: sp.expense.date, amount: sp.amount }))

  const html = invoiceEmailHtml({
    senderName: user.name,
    recipientName: person.name,
    items,
    total,
    note: note || null,
    dueDate: due_date || null,
  })

  await sendEmail({
    to: person.email,
    subject: `Invoice from ${user.name} — ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)} due`,
    html,
  })

  return NextResponse.json({ success: true })
}
