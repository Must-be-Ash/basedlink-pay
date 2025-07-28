import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/user'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'

// GET /api/users/by-wallet?address=0x123... - Find user by wallet address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('address')
    
    if (!walletAddress) {
      return createErrorResponse('Wallet address is required', 400)
    }

    const user = await UserModel.findByWalletAddress(walletAddress)
    
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(user, 'User found successfully')
  } catch (error) {
    return handleApiError(error)
  }
}