export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateAuthenticationOptions } from '@simplewebauthn/server'

const RP_ID = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : 'localhost'

// POST /api/auth/passkey/login-options
// Returns WebAuthn authentication options for verifying an enrolled passkey
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, passkeys: { select: { credential_id: true, transports: true } } },
  })
  if (!profile) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
  if (!profile.passkeys.length) return NextResponse.json({ success: false, message: 'No passkeys enrolled' }, { status: 400 })

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: profile.passkeys.map(p => ({
      id: p.credential_id,
      transports: JSON.parse(p.transports || '[]'),
    })),
    userVerification: 'preferred',
  })

  // Store challenge
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
