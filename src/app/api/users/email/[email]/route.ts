import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError, validateEmail } from '@/lib/api-utils'

// GET /api/users/email/[email] - Get user by email
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await context.params
    const decodedEmail = decodeURIComponent(email)

    if (!validateEmail(decodedEmail)) {
      return createErrorResponse('Invalid email format', 400)
    }

    const user = await UserModel.findByEmail(decodedEmail)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}