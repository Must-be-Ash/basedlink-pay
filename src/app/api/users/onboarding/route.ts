import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { uploadProfileImage, deleteProfileImage } from '@/lib/vercel-blob'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'
import { onboardingSchema } from '@/lib/validation'

// POST /api/users/onboarding - Complete user onboarding
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const username = formData.get('username') as string
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const userId = formData.get('userId') as string
    const profileImage = formData.get('profileImage') as File | null
    
    // Validate required fields
    if (!username || !name || !userId) {
      return createErrorResponse('Username, name, and userId are required', 400)
    }
    
    // Validate input data
    const validation = onboardingSchema.safeParse({ username, name, bio })
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }
    
    // Check if user exists
    const existingUser = await UserModel.findById(userId)
    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }
    
    // Check username availability (excluding current user)
    const isUsernameAvailable = await UserModel.isUsernameAvailable(username, userId)
    if (!isUsernameAvailable) {
      return createErrorResponse('Username is already taken', 409)
    }
    
    let profileImageUrl = existingUser.profileImageUrl
    
    // Upload new profile image if provided
    if (profileImage && profileImage.size > 0) {
      // Delete old image if exists
      if (existingUser.profileImageUrl) {
        await deleteProfileImage(existingUser.profileImageUrl)
      }
      
      // Upload new image
      profileImageUrl = await uploadProfileImage(profileImage, userId)
    }
    
    // Update user with onboarding data
    const updatedUser = await UserModel.updateById(userId, {
      username: validation.data.username,
      name: validation.data.name,
      bio: validation.data.bio,
      profileImageUrl,
      isOnboardingComplete: true
    })
    
    if (!updatedUser) {
      return createErrorResponse('Failed to update user', 500)
    }
    
    return createSuccessResponse(updatedUser, 'Onboarding completed successfully')
  } catch (error) {
    return handleApiError(error)
  }
} 