import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Paths that don't require auth or 2FA
const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/verify',
  '/portal',
  '/reset-password',
  '/curalog',
  '/api/auth',
  '/api/twilio',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Root path is public
  if (pathname === '/') return NextResponse.next()

  // Allow public paths and Next.js internals
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Refresh Supabase session tokens in cookies if needed
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
          list.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            res.cookies.set(name, value, options as any)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Check 2FA verification cookie
  const verified = request.cookies.get('curalog_2fa')?.value === 'verified'
  if (!verified) {
    const url = new URL('/verify', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const proxyConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
