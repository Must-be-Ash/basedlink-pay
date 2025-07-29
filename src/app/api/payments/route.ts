import { NextRequest } from 'next/server'
import { PaymentModel } from '@/lib/models/payment'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { createPaymentSchema, createPendingPaymentSchema } from '@/lib/validation'

// GET /api/payments - Get user's payments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sellerId = searchParams.get('sellerId')
    const productId = searchParams.get('productId')

    if (sellerId) {
      if (!validateObjectId(sellerId)) {
        return createErrorResponse('Invalid sellerId format', 400)
      }
      const payments = await PaymentModel.findWithProduct(sellerId)
      return createSuccessResponse(payments)
    }

    if (productId) {
      if (!validateObjectId(productId)) {
        return createErrorResponse('Invalid productId format', 400)
      }
      const payments = await PaymentModel.findByProduct(productId)
      return createSuccessResponse(payments)
    }

    return createErrorResponse('sellerId or productId is required', 400)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Try pending payment schema first (new flow), then full payment schema (legacy)
    let validation = createPendingPaymentSchema.safeParse(body)
    let isPendingPayment = true
    
    if (!validation.success) {
      validation = createPaymentSchema.safeParse(body)
      isPendingPayment = false
      
      if (!validation.success) {
        return createErrorResponse(validation.error.errors[0].message, 400)
      }
    }

    // Verify product exists and is active
    const product = await ProductModel.findById(validation.data.productId)
    if (!product) {
      return createErrorResponse('Product not found', 404)
    }

    if (!product.isActive) {
      return createErrorResponse('Product is not active', 400)
    }

    // Verify payment amount matches product price
    if (Math.abs(validation.data.amountUSDC - product.priceUSDC) > 0.01) {
      return createErrorResponse('Payment amount does not match product price', 400)
    }

    // For pending payments, check and clean up any existing pending payments for same user/product
    if (isPendingPayment) {
      const db = await (await import('@/lib/mongodb')).getDatabase()
      const collection = db.collection('payments')
      
      // Remove any existing pending payments for this user/product combination
      await collection.deleteMany({
        productId: new (await import('mongodb')).ObjectId(validation.data.productId),
        buyerWalletAddress: validation.data.buyerWalletAddress,
        status: 'pending',
        transactionHash: null
      })
    }

    // For payments with transaction hash, check if it already exists
    if (!isPendingPayment && 'transactionHash' in validation.data && validation.data.transactionHash) {
      const existingPayment = await PaymentModel.findByTransactionHash(validation.data.transactionHash as string)
      if (existingPayment) {
        return createErrorResponse('Payment with this transaction hash already exists', 409)
      }
    }

    // Create payment with appropriate status
    const paymentData = {
      ...validation.data,
      status: isPendingPayment ? 'pending' : 'completed'
    }

    const payment = await PaymentModel.create(paymentData)
    return createSuccessResponse(payment, 'Payment created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}