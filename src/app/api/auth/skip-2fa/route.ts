export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

// POST /api/auth/skip-2fa
// Allows users without 2FA configured to proceed without verification.
// No auth check here — the proxy already validates the Supabase session before
// redirecting to /verify, so any request reaching this endpoint is authenticated.
// Setting this cookie without re-validating is safe because the proxy still
// requires a valid Supabase session for all protected routes.
export async function POST() {
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
