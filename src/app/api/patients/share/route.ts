export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

function randomCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// POST /api/patients/share?id=patientId — generate (or return existing) share code
export async function POST(req: NextRequest) {
  await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'Patient ID required' }, { status: 400 })

  const patient = await prisma.patient.findUnique({ where: { id }, select: { id: true, share_code: true } })
  if (!patient) return NextResponse.json<ApiResponse>({ success: false, message: 'Not found' }, { status: 404 })

  if (patient.share_code) {
    return NextResponse.json<ApiResponse>({ success: true, data: { code: patient.share_code } })
  }

  // Generate unique code
  let code = randomCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.patient.findUnique({ where: { share_code: code } })
    if (!existing) break
    code = randomCode()
    attempts++
  }

  const updated = await prisma.patient.update({ where: { id }, data: { share_code: code } })
  return NextResponse.json<ApiResponse>({ success: true, data: { code: updated.share_code } })
}

// DELETE /api/patients/share?id=patientId — revoke share code
export async function DELETE(req: NextRequest) {
  await requireAuth()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json<ApiResponse>({ success: false, message: 'Patient ID required' }, { status: 400 })
  await prisma.patient.update({ where: { id }, data: { share_code: null } })
  return NextResponse.json<ApiResponse>({ success: true })
}
