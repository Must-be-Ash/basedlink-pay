import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { updateUserSchema } from '@/lib/validation'

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid user ID format', 400)
    }

    const user = await UserModel.findById(id)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid user ID format', 400)
    }

    // Validate request body
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    const user = await UserModel.updateById(id, validation.data)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(user, 'User updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}