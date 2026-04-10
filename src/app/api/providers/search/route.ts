export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { searchProviders } from '@/services/npi'
import { requireAuth } from '@/lib/auth'
import type { ApiResponse, NPIResult } from '@/types'

export async function GET(req: NextRequest) {
  await requireAuth()

  const p = req.nextUrl.searchParams
  const lastName = p.get('last_name')?.trim() || p.get('q')?.trim() || ''
  if (!lastName || lastName.length < 2) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Last name required (min 2 chars)' }, { status: 400 })
  }

  try {
    const results = await searchProviders({
      lastName,
      firstName: p.get('first_name')?.trim() || undefined,
      city: p.get('city')?.trim() || undefined,
      state: p.get('state')?.trim() || undefined,
      zip: p.get('zip')?.trim() || undefined,
      type: (p.get('type') as 'NPI-1' | 'NPI-2') || 'NPI-1',
      limit: parseInt(p.get('limit') || '25'),
    })
    return NextResponse.json<ApiResponse<NPIResult[]>>({ success: true, data: results })
  } catch (e) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Search failed' }, { status: 500 })
  }
}
