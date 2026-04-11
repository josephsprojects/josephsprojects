import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export const metadata = { title: 'Settings' }

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await requireOwner()
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, role: true },
  })
  return <SettingsClient user={profile as any} />
}
