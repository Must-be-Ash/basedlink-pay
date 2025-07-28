import { NextRequest } from 'next/server'
import { PaymentModel } from '@/lib/models/payment'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'

// GET /api/analytics/seller/[sellerId] - Get seller analytics
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await context.params

    if (!validateObjectId(sellerId)) {
      return createErrorResponse('Invalid seller ID format', 400)
    }

    // Get seller earnings
    const earnings = await PaymentModel.getSellerEarnings(sellerId)
    
    // Get product count
    const products = await ProductModel.findBySeller(sellerId)
    const activeProducts = products.filter(p => p.isActive)
    
    // Get recent payments
    const recentPayments = await PaymentModel.findBySeller(sellerId)
    const completedPayments = recentPayments.filter(p => p.status === 'completed')
    
    const analytics = {
      totalEarnings: earnings.totalEarnings,
      totalSales: earnings.totalSales,
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      averageOrderValue: earnings.totalSales > 0 ? earnings.totalEarnings / earnings.totalSales : 0,
      recentPayments: completedPayments.slice(0, 10), // Last 10 payments
    }

    return createSuccessResponse(analytics)
  } catch (error) {
    return handleApiError(error)
  }
}