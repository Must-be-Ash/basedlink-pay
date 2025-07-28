import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'

// GET /api/products/public/[paymentLink] - Get product by payment link (public access)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ paymentLink: string }> }
) {
  try {
    const { paymentLink } = await context.params

    if (!paymentLink || paymentLink.trim() === '') {
      return createErrorResponse('Payment link is required', 400)
    }

    const product = await ProductModel.findActiveByPaymentLink(paymentLink)
    if (!product) {
      return createErrorResponse('Product not found or inactive', 404)
    }

    // Get product with seller information for display
    const productWithSeller = await ProductModel.findWithSeller(product._id!.toString())
    if (!productWithSeller) {
      return createErrorResponse('Product details not found', 404)
    }

    return createSuccessResponse(productWithSeller)
  } catch (error) {
    return handleApiError(error)
  }
}