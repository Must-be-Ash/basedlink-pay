import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'
import { createUserSchema } from '@/lib/validation'

// POST /api/users - Create or find user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = createUserSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    const { email, name, walletAddress } = validation.data

    // Find or create user
    const user = await UserModel.findOrCreate(email, name, walletAddress)
    return createSuccessResponse(user, 'User found or created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}