import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin, createCorsHeaders } from './lib/security'

export function middleware(request: NextRequest) {
  // Skip middleware for static files and internal routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Apply security checks only to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Validate origin for API requests
    if (!validateOrigin(request)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'Access denied from this origin',
          code: 'ORIGIN_NOT_ALLOWED'
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin')
      const corsHeaders = createCorsHeaders(origin)
      return new NextResponse(null, { status: 200, headers: corsHeaders })
    }

    // Add CORS headers to API responses
    const response = NextResponse.next()
    const origin = request.headers.get('origin')
    const corsHeaders = createCorsHeaders(origin)
    
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  }

  // For non-API routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}