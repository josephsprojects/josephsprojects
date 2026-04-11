export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/auth/passkey/list — list enrolled passkeys
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ success: false }, { status: 404 })

  const passkeys = await prisma.passkey.findMany({
    where: { user_id: profile.id },
    select: { id: true, name: true, created_at: true, last_used: true },
    orderBy: { created_at: 'asc' },
  })

  return NextResponse.json({ success: true, data: passkeys })
}

// DELETE /api/auth/passkey/list — remove a passkey
// Body: { id: string }
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  const { id } = await req.json()

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ success: false }, { status: 404 })

  await prisma.passkey.deleteMany({ where: { id, user_id: profile.id } })

  return NextResponse.json({ success: true })
}

// PATCH /api/auth/passkey/list — rename a passkey
// Body: { id: string, name: string }
export async function PATCH(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  const { id, name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ success: false, message: 'Name required' }, { status: 400 })

  const profile = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ success: false }, { status: 404 })

  await prisma.passkey.updateMany({ where: { id, user_id: profile.id }, data: { name: name.trim() } })

  return NextResponse.json({ success: true })
}
