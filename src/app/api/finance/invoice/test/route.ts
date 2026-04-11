export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sendEmail, invoiceEmailHtml } from '@/lib/sendgrid'

export async function POST() {
  const user = await requireAuth()

  const html = invoiceEmailHtml({
    senderName: user.name,
    recipientName: user.name,
    items: [
      { name: 'Netflix (March)', date: new Date('2026-03-01'), amount: 15.99 },
      { name: 'Spotify Family', date: new Date('2026-03-01'), amount: 7.50 },
      { name: 'Dinner – Carbone', date: new Date('2026-03-15'), amount: 62.00 },
      { name: 'Groceries – Whole Foods', date: new Date('2026-03-22'), amount: 44.75 },
    ],
    total: 130.24,
    note: 'This is a test invoice. Your actual invoices will list real unpaid shared expenses.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  await sendEmail({
    to: user.email,
    subject: `[TEST] Invoice from ${user.name} — $130.24 due`,
    html,
  })

  return NextResponse.json({ success: true, sentTo: user.email })
}
