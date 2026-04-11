export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SB_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  await requireOwner()

  // Fetch all users from our DB (includes signup time)
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true, supabase_id: true, email: true, name: true,
      role: true, status: true, created_at: true,
    },
  })

  return NextResponse.json({ success: true, data: users })
}

export async function PATCH(req: NextRequest) {
  await requireOwner()
  const { supabase_id, password } = await req.json()

  if (!supabase_id || !password) {
    return NextResponse.json({ success: false, message: 'Missing supabase_id or password' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (!SERVICE_KEY) {
    return NextResponse.json({ success: false, message: 'Service role key not configured' }, { status: 500 })
  }

  // Use Supabase Admin API to reset the user's password
  const res = await fetch(`${SB_URL}/auth/v1/admin/users/${supabase_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ password }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ success: false, message: `Supabase error: ${err}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Password reset successfully' })
}
