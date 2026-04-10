import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const FEATURE_FLAGS = [
  { key: 'sms_notifications', name: 'SMS Notifications', description: 'Send refill reminders via Twilio SMS', enabled: false, env: 'production' },
  { key: 'provider_portal', name: 'Provider Portal', description: 'Full provider workspace features', enabled: false, env: 'production' },
  { key: 'document_vault', name: 'Document Vault', description: 'Upload and store medical documents', enabled: false, env: 'beta' },
  { key: 'adherence_tracking', name: 'Adherence Tracking', description: 'Log taken/missed/skipped doses', enabled: false, env: 'beta' },
  { key: 'symptom_log', name: 'Symptom Log', description: 'Patient symptom tracking per medication', enabled: false, env: 'beta' },
  { key: 'emergency_summary', name: 'Emergency Summary', description: 'Printable emergency medication card', enabled: false, env: 'beta' },
  { key: 'messaging', name: 'In-App Messaging', description: 'Direct messaging between care team members', enabled: false, env: 'production' },
  { key: 'rxnorm_live', name: 'Live RxNorm API', description: 'Real-time medication name search', enabled: true, env: 'production' },
  { key: 'npi_search', name: 'NPI Registry Search', description: 'Provider lookup via NPI registry', enabled: true, env: 'production' },
  { key: 'two_factor', name: 'Two-Factor Auth (2FA)', description: 'Optional 2FA for all users', enabled: false, env: 'beta' },
  { key: 'drug_interactions', name: 'Drug Interaction Checker', description: 'Flag potential medication interactions', enabled: false, env: 'roadmap' },
  { key: 'ehr_sync', name: 'EHR Sync', description: 'Integration with Epic/Cerner EHR systems', enabled: false, env: 'roadmap' },
]

async function main() {
  const OWNER_EMAIL = process.env.OWNER_EMAIL || 'joseph@dataprimetech.com'
  const OWNER_NAME = process.env.OWNER_NAME || 'Joseph Diaz-Ordonez'

  console.log('🌱 Seeding CuraLog database…')

  // ── 1. Create Supabase Auth user for owner ───────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let supabaseUserId: string | null = null

  // Check if owner already exists in Supabase Auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingOwner = existingUsers?.users?.find(u => u.email === OWNER_EMAIL)

  if (existingOwner) {
    supabaseUserId = existingOwner.id
    console.log(`✓ Supabase Auth user already exists: ${OWNER_EMAIL}`)
  } else {
    // Create the owner in Supabase Auth
    // NOTE: Owner must set their password via /forgot-password on first login
    // Or set it here for dev: password: 'your-dev-password'
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: OWNER_EMAIL,
      email_confirm: true,
      user_metadata: { name: OWNER_NAME, role: 'platform_owner' }
    })
    if (error) {
      console.error('Failed to create Supabase Auth user:', error.message)
      console.log('If you already have an account, set SUPABASE_USER_ID env var to skip this step.')
    } else {
      supabaseUserId = newUser.user.id
      console.log(`✓ Created Supabase Auth user: ${OWNER_EMAIL} (id: ${supabaseUserId})`)
    }
  }

  // ── 2. Upsert owner in DB ───────────────────────────────────────────────────
  if (supabaseUserId) {
    await prisma.user.upsert({
      where: { supabase_id: supabaseUserId },
      update: { name: OWNER_NAME, role: 'platform_owner', email: OWNER_EMAIL },
      create: {
        supabase_id: supabaseUserId,
        email: OWNER_EMAIL,
        name: OWNER_NAME,
        role: 'platform_owner',
        initials: 'JD',
        color: 'var(--teal)',
        status: 'active',
      }
    })
    console.log(`✓ Owner user upserted: ${OWNER_NAME} <${OWNER_EMAIL}>`)
  }

  // ── 3. Seed feature flags ───────────────────────────────────────────────────
  for (const flag of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},          // don't overwrite enabled state on re-seed
      create: flag as any,
    })
  }
  console.log(`✓ Seeded ${FEATURE_FLAGS.length} feature flags`)

  // ── 4. System settings ──────────────────────────────────────────────────────
  const settings = [
    { key: 'platform_name', value: 'CuraLog' },
    { key: 'platform_owner_email', value: OWNER_EMAIL },
    { key: 'platform_owner_name', value: OWNER_NAME },
    { key: 'seeded_at', value: new Date().toISOString() },
  ]

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('✓ System settings saved')

  console.log('\n🎉 Seed complete.')
  console.log(`   Owner:  ${OWNER_NAME}`)
  console.log(`   Email:  ${OWNER_EMAIL}`)
  console.log(`   Login:  /login → use "Forgot password?" to set your password`)
  console.log('\n   The platform starts blank — no fake data has been seeded.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
