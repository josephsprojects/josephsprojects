export const dynamic = 'force-dynamic'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FinanceClient from './FinanceClient'

export const metadata = { title: 'Fintra — DataPrimeTech' }

export default async function FinancePage() {
  const user = await requireAuth()

  const [cards, subs, bills, people, expenses, snapshots] = await Promise.all([
    prisma.creditCard.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'asc' } }),
    prisma.subscription.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'asc' } }),
    prisma.bill.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'asc' } }),
    prisma.financePerson.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'asc' } }),
    prisma.sharedExpense.findMany({
      where: { user_id: user.id },
      orderBy: { date: 'desc' },
      include: { splits: { include: { person: true } } },
    }),
    prisma.financeSnapshot.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'desc' }, take: 24 }),
  ])

  return (
    <FinanceClient
      user={{ id: user.id, name: user.name, email: user.email }}
      initialCards={cards as any}
      initialSubs={subs as any}
      initialBills={bills as any}
      initialPeople={people as any}
      initialExpenses={expenses as any}
      initialSnapshots={snapshots as any}
    />
  )
}
