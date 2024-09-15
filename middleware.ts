// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// You can add any paths that should be accessible without authentication
const publicPaths = ['/api/auth/signin', '/api/auth/signout', '/api/auth/session', '/api/auth/providers']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname is in the public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Get the token from the request
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If there's no token and the path isn't public, redirect to signin
  if (!token && pathname !== '/api/auth/signin') {
    const signInUrl = new URL('/api/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(signInUrl)
  }

  // If there's a token and the user is trying to access the signin page, redirect to dashboard
  if (token && pathname === '/api/auth/signin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure on which routes to run the middleware
export const config = {
  // You can exclude api routes if you don't want to run middleware on them
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
}