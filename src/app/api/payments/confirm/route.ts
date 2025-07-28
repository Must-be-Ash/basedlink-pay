import { NextRequest } from 'next/server'
import { PaymentModel } from '@/lib/models/payment'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'

// POST /api/payments/confirm - Confirm payment by transaction hash
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionHash } = body

    if (!transactionHash) {
      return createErrorResponse('Transaction hash is required', 400)
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      return createErrorResponse('Invalid transaction hash format', 400)
    }

    const payment = await PaymentModel.markCompleted(transactionHash)
    if (!payment) {
      return createErrorResponse('Payment not found', 404)
    }

    return createSuccessResponse(payment, 'Payment confirmed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}