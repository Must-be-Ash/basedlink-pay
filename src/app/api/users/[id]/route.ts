import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { updateUserSchema } from '@/lib/validation'
import { withUserOwnership } from '@/lib/middleware-auth'
import type { User } from '@/types/user'

// GET /api/users/[id] - Get user profile (requires ownership)
export const GET = withUserOwnership(async (
  request: NextRequest,
  user: User,
  userId: string
) => {
  try {
    if (!validateObjectId(userId)) {
      return createErrorResponse('Invalid user ID format', 400)
    }

    // User is already verified to own this profile by the middleware
    const userData = await UserModel.findById(userId)
    if (!userData) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(userData)
  } catch (error) {
    return handleApiError(error)
  }
})

// PUT /api/users/[id] - Update user profile (requires ownership)
export const PUT = withUserOwnership(async (
  request: NextRequest,
  user: User,
  userId: string
) => {
  try {
    const body = await request.json()

    if (!validateObjectId(userId)) {
      return createErrorResponse('Invalid user ID format', 400)
    }

    // Validate request body
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    // Critical security check: Ensure user can only update their own profile
    if (user._id!.toString() !== userId) {
      return createErrorResponse('Forbidden: You can only update your own profile', 403)
    }

    // Prevent tampering with critical fields
    const safeUpdates = { ...validation.data }
    delete (safeUpdates as Record<string, unknown>)._id        // Never allow changing ID
    delete (safeUpdates as Record<string, unknown>).email      // Never allow changing email through this endpoint
    delete (safeUpdates as Record<string, unknown>).walletAddress // Never allow changing wallet address through this endpoint
    delete (safeUpdates as Record<string, unknown>).createdAt  // Never allow changing creation date

    const updatedUser = await UserModel.updateById(userId, safeUpdates)
    if (!updatedUser) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(updatedUser, 'User updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
})