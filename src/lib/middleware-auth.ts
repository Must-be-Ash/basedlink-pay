import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, verifyResourceOwnership, getUserId } from '@/lib/auth'
import { createErrorResponse } from '@/lib/api-utils'
import type { User } from '@/types/user'

/**
 * Higher-order function that wraps API handlers with authentication
 */
export function withAuth(
  handler: (request: NextRequest, user: User, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    try {
      // Authenticate the user
      const user = await requireAuth(request)
      if (!user) {
        return createErrorResponse('Unauthorized: Authentication required', 401)
      }

      // Call the original handler with the authenticated user
      return await handler(request, user, ...args)
    } catch (error) {
      console.error('Authentication middleware error:', error)
      return createErrorResponse('Authentication failed', 500)
    }
  }
}

/**
 * Higher-order function that wraps API handlers with authentication and ownership verification
 */
export function withOwnership(resourceType: 'product' | 'user') {
  return function(
    handler: (request: NextRequest, user: User, resourceId: string, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return withAuth(async (request: NextRequest, user: User, ...args: unknown[]): Promise<NextResponse> => {
      try {
        // Extract resource ID from the URL path
        const pathParts = request.nextUrl.pathname.split('/')
        const resourceId = pathParts[pathParts.length - 1]
        
        if (!resourceId) {
          return createErrorResponse('Invalid resource ID', 400)
        }

        // Verify ownership
        const hasAccess = await verifyResourceOwnership(getUserId(user), resourceType, resourceId)
        if (!hasAccess) {
          return createErrorResponse(`Forbidden: You do not have access to this ${resourceType}`, 403)
        }

        // Call the original handler with authenticated user and verified resource ID
        return await handler(request, user, resourceId, ...args)
      } catch (error) {
        console.error('Ownership verification error:', error)
        return createErrorResponse('Access verification failed', 500)
      }
    })
  }
}

/**
 * Middleware for endpoints that require authentication but no specific ownership
 * (like creating new resources or accessing general user data)
 */
export function withUserAuth(
  handler: (request: NextRequest, user: User, ...args: unknown[]) => Promise<NextResponse>
) {
  return withAuth(handler)
}

/**
 * Middleware specifically for product-related endpoints requiring ownership
 */
export function withProductOwnership(
  handler: (request: NextRequest, user: User, productId: string, ...args: unknown[]) => Promise<NextResponse>
) {
  return withOwnership('product')(handler)
}

/**
 * Middleware specifically for user-related endpoints requiring ownership
 */
export function withUserOwnership(
  handler: (request: NextRequest, user: User, userId: string, ...args: unknown[]) => Promise<NextResponse>
) {
  return withOwnership('user')(handler)
}

/**
 * Middleware for seller analytics endpoints
 */
export function withSellerAccess(
  handler: (request: NextRequest, user: User, sellerId: string, ...args: unknown[]) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: User, ...args: unknown[]): Promise<NextResponse> => {
    try {
      // Extract seller ID from the URL path
      const pathParts = request.nextUrl.pathname.split('/')
      const sellerIdIndex = pathParts.findIndex(part => part === 'seller') + 1
      const sellerId = pathParts[sellerIdIndex]
      
      if (!sellerId) {
        return createErrorResponse('Invalid seller ID', 400)
      }

      // Users can only access their own analytics
      if (getUserId(user) !== sellerId) {
        return createErrorResponse('Forbidden: You can only access your own analytics', 403)
      }

      // Call the original handler
      return await handler(request, user, sellerId, ...args)
    } catch (error) {
      console.error('Seller access verification error:', error)
      return createErrorResponse('Access verification failed', 500)
    }
  })
}