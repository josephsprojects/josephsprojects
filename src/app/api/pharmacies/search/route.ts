export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { searchPharmacies } from '@/services/npi'
import { requireAuth } from '@/lib/auth'
import type { ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  await requireAuth()

  const p = req.nextUrl.searchParams
  const name = p.get('name')?.trim() || p.get('q')?.trim() || ''
  const zip = p.get('zip')?.trim() || ''

  if (!name && !zip) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Name or ZIP required' }, { status: 400 })
  }

  try {
    const results = await searchPharmacies({
      name: name || undefined,
      city: p.get('city')?.trim() || undefined,
      state: p.get('state')?.trim() || undefined,
      zip: zip || undefined,
    })
    return NextResponse.json<ApiResponse>({ success: true, data: results })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Search failed' }, { status: 500 })
  }
}
