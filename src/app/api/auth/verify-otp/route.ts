export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// POST /api/auth/verify-otp
// Body: { code: string }
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const { code } = await req.json()
  if (!code?.trim()) return NextResponse.json({ success: false, message: 'Code required' }, { status: 400 })

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

  const session = await prisma.otpSession.findFirst({
    where: {
      user_id: profile.id,
      channel: { in: ['sms', 'email'] },
      used: false,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: 'desc' },
  })

  if (!session || session.code !== code.trim()) {
    return NextResponse.json({ success: false, message: 'Invalid or expired code.' }, { status: 400 })
  }

  await prisma.otpSession.update({ where: { id: session.id }, data: { used: true } })

  const res = NextResponse.json({ success: true })
  res.cookies.set('curalog_2fa', 'verified', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return res
}

// DELETE /api/auth/verify-otp — clear 2FA cookie (on logout)
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('curalog_2fa', '', { maxAge: 0, path: '/' })
  return res
}
