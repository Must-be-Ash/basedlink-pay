import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import type { User } from '@/types/user'

/**
 * Authentication middleware for API routes
 * Validates user identity based on email and wallet address headers
 */
export async function requireAuth(request: NextRequest): Promise<User | null> {
  try {
    // Extract authentication headers sent from the client
    const userEmail = request.headers.get('x-user-email')
    const walletAddress = request.headers.get('x-wallet-address')
    
    // Both email and wallet address are required for authentication
    if (!userEmail || !walletAddress) {
      console.log('Auth failed: Missing email or wallet address headers')
      return null
    }

    // Find user by email in the database
    const user = await UserModel.findByEmail(userEmail)
    if (!user) {
      console.log('Auth failed: User not found')
      return null
    }

    // Verify that the wallet address matches the user's stored wallet address
    if (user.walletAddress !== walletAddress) {
      console.log('Auth failed: Wallet address mismatch')
      return null
    }

    // Ensure user has completed onboarding
    if (!user.isOnboardingComplete) {
      console.log('Auth failed: User has not completed onboarding')
      return null
    }

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Verify if a user owns a specific resource
 */
export async function verifyResourceOwnership(
  userId: string, 
  resourceType: 'product' | 'user', 
  resourceId: string
): Promise<boolean> {
  try {
    if (resourceType === 'user') {
      // For user resources, user can only access their own profile
      return userId === resourceId
    }
    
    if (resourceType === 'product') {
      // For product resources, check if user is the seller
      const { ProductModel } = await import('@/lib/models/product')
      const product = await ProductModel.findById(resourceId)
      return product ? product.sellerId.toString() === userId : false
    }
    
    return false
  } catch (error) {
    console.error('Resource ownership verification error:', error)
    return false
  }
}

/**
 * Extract user ID from the authenticated user
 */
export function getUserId(user: User): string {
  return user._id!.toString()
}

/**
 * Check if user can access seller analytics
 */
export async function canAccessSellerAnalytics(userId: string, sellerId: string): Promise<boolean> {
  // Users can only access their own analytics
  return userId === sellerId
}