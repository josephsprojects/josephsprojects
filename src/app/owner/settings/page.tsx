import { requireOwner } from '@/lib/auth'
import SettingsClient from './SettingsClient'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const user = await requireOwner()
  return <SettingsClient user={{ id: user.id, name: user.name, email: user.email, role: user.role }} />
}
