import { NextRequest, NextResponse } from 'next/server'
import { searchMedications } from '@/services/rxnorm'
import type { ApiResponse, MedSearchResult } from '@/types'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json<ApiResponse>({ success: false, message: 'Query too short' }, { status: 400 })
  }

  try {
    const results = await searchMedications(q)
    return NextResponse.json<ApiResponse<MedSearchResult[]>>({ success: true, data: results })
  } catch (e) {
    console.error('Medication search error:', e)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Search failed' }, { status: 500 })
  }
}
