export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

const RP_ID = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// POST /api/auth/passkey/register-verify
// Body: WebAuthn registration response from browser + optional { name }
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const { name, ...registrationResponse } = body

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

  const challengeSession = await prisma.otpSession.findFirst({
    where: { user_id: profile.id, channel: 'passkey_challenge', used: false, expires_at: { gt: new Date() } },
    orderBy: { created_at: 'desc' },
  })
  if (!challengeSession) {
    return NextResponse.json({ success: false, message: 'Challenge expired. Try again.' }, { status: 400 })
  }

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: challengeSession.code,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 400 })
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ success: false, message: 'Verification failed.' }, { status: 400 })
  }

  const { credential } = verification.registrationInfo
  const count = await prisma.passkey.count({ where: { user_id: profile.id } })

  await prisma.passkey.create({
    data: {
      user_id: profile.id,
      credential_id: credential.id,
      public_key: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: JSON.stringify(registrationResponse.response.transports ?? []),
      name: name?.trim() || `Passkey ${count + 1}`,
    },
  })

  await prisma.otpSession.update({ where: { id: challengeSession.id }, data: { used: true } })

  return NextResponse.json({ success: true })
}
