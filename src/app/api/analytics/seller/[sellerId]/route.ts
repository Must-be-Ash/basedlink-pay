import { NextRequest } from 'next/server'
import { PaymentModel } from '@/lib/models/payment'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { withSellerAccess } from '@/lib/middleware-auth'
import type { User } from '@/types/user'

// GET /api/analytics/seller/[sellerId] - Get seller analytics (requires ownership)
export const GET = withSellerAccess(async (
  request: NextRequest,
  user: User,
  sellerId: string
) => {
  try {
    if (!validateObjectId(sellerId)) {
      return createErrorResponse('Invalid seller ID format', 400)
    }

    // Critical security check: User can only access their own analytics
    if (user._id!.toString() !== sellerId) {
      return createErrorResponse('Forbidden: You can only access your own analytics', 403)
    }

    // Get seller earnings
    const earnings = await PaymentModel.getSellerEarnings(sellerId)
    
    // Get product count
    const products = await ProductModel.findBySeller(sellerId)
    const activeProducts = products.filter(p => p.isActive)
    
    // Get recent payments (sanitized for security)
    const recentPayments = await PaymentModel.findBySeller(sellerId)
    const completedPayments = recentPayments.filter(p => p.status === 'completed')
    
    // Sanitize payment data - remove sensitive buyer information
    const sanitizedPayments = completedPayments.slice(0, 10).map(payment => ({
      _id: payment._id,
      productId: payment.productId,
      amountUSD: payment.amountUSD,
      amountUSDC: payment.amountUSDC,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      // Remove sensitive buyer information
      // buyerEmail: payment.buyerEmail,        // REMOVED for privacy
      // buyerWalletAddress: payment.buyerWalletAddress, // REMOVED for privacy
      // fromAddress: payment.fromAddress,      // REMOVED for privacy
      // toAddress: payment.toAddress,          // REMOVED for privacy
      // transactionHash: payment.transactionHash // Could be removed for additional privacy
    }))
    
    const analytics = {
      totalEarnings: earnings.totalEarnings,
      totalSales: earnings.totalSales,
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      averageOrderValue: earnings.totalSales > 0 ? earnings.totalEarnings / earnings.totalSales : 0,
      recentPayments: sanitizedPayments,
    }

    return createSuccessResponse(analytics)
  } catch (error) {
    return handleApiError(error)
  }
})