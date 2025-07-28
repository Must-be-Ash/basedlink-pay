import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'
import { usernameCheckSchema } from '@/lib/validation'

// GET /api/users/check-username?username=test&excludeUserId=123 - Check username availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const excludeUserId = searchParams.get('excludeUserId')
    
    if (!username) {
      return createErrorResponse('Username is required', 400)
    }
    
    // Validate username format
    const validation = usernameCheckSchema.safeParse({ username })
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }
    
    const isAvailable = await UserModel.isUsernameAvailable(username, excludeUserId || undefined)
    
    return createSuccessResponse(
      { 
        username,
        available: isAvailable,
        message: isAvailable ? 'Username is available' : 'Username is already taken'
      },
      isAvailable ? 'Username is available' : 'Username is already taken'
    )
  } catch (error) {
    return handleApiError(error)
  }
} 