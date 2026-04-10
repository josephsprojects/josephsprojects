import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await requireOwner()
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ ok: false })

  try {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 5000)
    const r = await fetch(url, { signal: ctrl.signal, next: { revalidate: 0 } })
    return NextResponse.json({ ok: r.ok, status: r.status })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
