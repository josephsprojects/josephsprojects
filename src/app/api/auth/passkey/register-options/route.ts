export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateRegistrationOptions } from '@simplewebauthn/server'

const RP_ID = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : 'localhost'

// POST /api/auth/passkey/register-options
// Returns WebAuthn registration options for enrolling a new passkey
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, email: true, name: true, passkeys: { select: { credential_id: true } } },
  })
  if (!profile) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

  const options = await generateRegistrationOptions({
    rpName: 'CuraLog',
    rpID: RP_ID,
    userName: profile.email,
    userDisplayName: profile.name,
    userID: Buffer.from(profile.id),
    attestationType: 'none',
    excludeCredentials: profile.passkeys.map(p => ({ id: p.credential_id })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  })

  // Store challenge for verification
  await prisma.otpSession.deleteMany({
    where: { user_id: profile.id, channel: 'passkey_challenge' },
  })
  await prisma.otpSession.create({
    data: {
      user_id: profile.id,
      code: options.challenge,
      channel: 'passkey_challenge',
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    },
  })

  return NextResponse.json(options)
}
