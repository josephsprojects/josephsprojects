export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import type { ApiResponse } from '@/types'

const COOKIE = 'curalog_test_mode'

export async function POST(req: NextRequest) {
  await requireOwner()
  const res = NextResponse.json<ApiResponse>({ success: true, data: { testMode: true } })
  res.cookies.set(COOKIE, '1', { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
  return res
}

export async function DELETE(req: NextRequest) {
  await requireOwner()
  const res = NextResponse.json<ApiResponse>({ success: true, data: { testMode: false } })
  res.cookies.delete(COOKIE)
  return res
}
