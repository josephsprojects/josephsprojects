export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'

const RP_ID = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// POST /api/auth/passkey/login-verify
// Body: WebAuthn authentication response from browser
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const authResponse = await req.json()

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, passkeys: true },
  })
  if (!profile) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

  const challengeSession = await prisma.otpSession.findFirst({
    where: { user_id: profile.id, channel: 'passkey_challenge', used: false, expires_at: { gt: new Date() } },
    orderBy: { created_at: 'desc' },
  })
  if (!challengeSession) {
    return NextResponse.json({ success: false, message: 'Challenge expired. Try again.' }, { status: 400 })
  }

  const passkey = profile.passkeys.find(p => p.credential_id === authResponse.id)
  if (!passkey) {
    return NextResponse.json({ success: false, message: 'Passkey not found.' }, { status: 400 })
  }

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challengeSession.code,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credential_id,
        publicKey: Buffer.from(passkey.public_key, 'base64url'),
        counter: passkey.counter,
        transports: JSON.parse(passkey.transports || '[]'),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 400 })
  }

  if (!verification.verified) {
    return NextResponse.json({ success: false, message: 'Passkey verification failed.' }, { status: 400 })
  }

  // Update counter and last_used
  await prisma.passkey.update({
    where: { id: passkey.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      last_used: new Date(),
    },
  })

  await prisma.otpSession.update({ where: { id: challengeSession.id }, data: { used: true } })

  const res = NextResponse.json({ success: true })
  res.cookies.set('curalog_2fa', 'verified', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}
