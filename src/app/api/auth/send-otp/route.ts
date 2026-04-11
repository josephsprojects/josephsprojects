export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

import { sendEmail, otpEmailHtml } from '@/lib/sendgrid'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/auth/send-otp
// Called from /verify page to send an OTP code
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  let profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, name: true, email: true, phone: true },
  })
  if (!profile && user.email) {
    const name = (user.user_metadata?.full_name as string) || user.email.split('@')[0]
    profile = await prisma.user.create({
      data: { supabase_id: user.id, email: user.email, name },
      select: { id: true, name: true, email: true, phone: true },
    })
  }
  if (!profile) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

  // Delete any existing unused OTP sessions for this user
  await prisma.otpSession.deleteMany({ where: { user_id: profile.id, used: false } })

  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.otpSession.create({
    data: { user_id: profile.id, code, channel: 'email', expires_at: expiresAt },
  })

  await sendEmail({
    to: profile.email,
    subject: 'CuraLog — Your verification code',
    html: otpEmailHtml(profile.name, code),
  })

  return NextResponse.json({
    success: true,
    channel: 'email',
    hint: `Code sent to ${profile.email.replace(/(.{2}).+(@.+)/, '$1•••$2')}`,
  })
}

// GET /api/auth/send-otp — check if user has passkeys enrolled
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ hasPasskeys: false })

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ hasPasskeys: false })

  const count = await prisma.passkey.count({ where: { user_id: profile.id } })
  return NextResponse.json({ hasPasskeys: count > 0 })
}
