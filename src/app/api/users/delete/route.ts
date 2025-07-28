import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'

// DELETE /api/users/delete - Delete user account and all associated data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    // Check if user exists
    const user = await UserModel.findById(userId)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    const db = await getDatabase()

    // Delete user's products
    await db.collection(COLLECTIONS.PRODUCTS).deleteMany({ sellerId: userId })

    // Delete user's payments (both as buyer and seller)
    await db.collection(COLLECTIONS.PAYMENTS).deleteMany({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    })

    // Delete the user account
    await db.collection(COLLECTIONS.USERS).deleteOne({ _id: user._id })

    return createSuccessResponse(null, 'Account deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}