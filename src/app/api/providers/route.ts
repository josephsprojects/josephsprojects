export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  await requireAuth()
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ success: false, message: 'Name required' }, { status: 400 })

  // Upsert by NPI if provided, otherwise by name
  const provider = body.npi
    ? await prisma.provider.upsert({
        where: { npi: body.npi },
        update: { name: body.name, specialty: body.specialty, address: body.address, city: body.city, state: body.state, phone: body.phone },
        create: body
      })
    : await prisma.provider.create({ data: { name: body.name, specialty: body.specialty, address: body.address, city: body.city, state: body.state, phone: body.phone, source: 'manual' } })

  return NextResponse.json({ success: true, data: provider })
}

export async function GET(req: NextRequest) {
  await requireAuth()
  const q = req.nextUrl.searchParams.get('q') || ''
  const providers = await prisma.provider.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
    take: 20, orderBy: { name: 'asc' }
  })
  return NextResponse.json({ success: true, data: providers })
}
