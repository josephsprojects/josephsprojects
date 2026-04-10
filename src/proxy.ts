import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password', '/curalog']
const OWNER_ROUTES = ['/owner']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some((r: any) => pathname === r) || pathname.startsWith('/invite/')) {
    return response
  }

  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verify session server-side
  const { data: { user }, error } = await supabase.auth.getUser()

  // Not authenticated — redirect to login
  if (!user || error) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Owner routes — verify owner role via DB
  if (OWNER_ROUTES.some((r: any) => pathname.startsWith(r))) {
    // Fetch role from DB (can't import prisma in edge, use supabase RPC instead)
    const { data: profile } = await supabase
      .from('users')
      .select('role, email')
      .eq('supabase_id', user.id)
      .single()

    const ownerEmail = process.env.OWNER_EMAIL || 'joseph@dataprimetech.com'

    if (!profile || profile.role !== 'platform_owner' || profile.email !== ownerEmail) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
