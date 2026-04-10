export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  await requireAuth()
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ success: false, message: 'Name required' }, { status: 400 })

  const pharmacy = await prisma.pharmacy.create({
    data: { name: body.name, address: body.address, city: body.city, state: body.state, zip: body.zip, phone: body.phone, npi: body.npi, source: body.source || 'manual' }
  })

  return NextResponse.json({ success: true, data: pharmacy })
}
