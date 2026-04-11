export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getDosageStrengths } from '@/services/rxnorm'

export async function GET(req: NextRequest) {
  const rxcui = req.nextUrl.searchParams.get('rxcui')?.trim()
  if (!rxcui) return NextResponse.json({ success: false, data: [] })
  const strengths = await getDosageStrengths(rxcui)
  return NextResponse.json({ success: true, data: strengths })
}
