import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
  await requireOwner()
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } })

  // If no flags seeded yet, return defaults
  const defaultFlags = [
    { id:'ff1',key:'sms_notifications',name:'SMS Notifications',description:'Send refill reminders via Twilio SMS',enabled:false,env:'production' },
    { id:'ff2',key:'provider_portal',name:'Provider Portal',description:'Full provider workspace features',enabled:false,env:'production' },
    { id:'ff3',key:'document_vault',name:'Document Vault',description:'Upload and store medical documents',enabled:false,env:'beta' },
    { id:'ff4',key:'adherence_tracking',name:'Adherence Tracking',description:'Log taken/missed/skipped doses',enabled:false,env:'beta' },
    { id:'ff5',key:'symptom_log',name:'Symptom Log',description:'Patient symptom tracking per medication',enabled:false,env:'beta' },
    { id:'ff6',key:'emergency_summary',name:'Emergency Summary',description:'Printable emergency medication card',enabled:false,env:'beta' },
    { id:'ff7',key:'messaging',name:'In-App Messaging',description:'Direct messaging between care team members',enabled:false,env:'production' },
    { id:'ff8',key:'rxnorm_live',name:'Live RxNorm API',description:'Real-time medication name search',enabled:true,env:'production' },
    { id:'ff9',key:'npi_search',name:'NPI Registry Search',description:'Provider lookup via NPI registry',enabled:true,env:'production' },
    { id:'ff10',key:'two_factor',name:'Two-Factor Auth (2FA)',description:'Optional 2FA for all users',enabled:false,env:'beta' },
  ]

  return <AdminClient flags={flags.length > 0 ? flags as any : defaultFlags} />
}
