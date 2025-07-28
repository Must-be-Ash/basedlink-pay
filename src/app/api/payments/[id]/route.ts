import { NextRequest } from 'next/server'
import { PaymentModel } from '@/lib/models/payment'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { updatePaymentSchema } from '@/lib/validation'

// GET /api/payments/[id] - Get specific payment
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid payment ID format', 400)
    }

    const payment = await PaymentModel.findById(id)
    if (!payment) {
      return createErrorResponse('Payment not found', 404)
    }

    return createSuccessResponse(payment)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/payments/[id] - Update payment status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid payment ID format', 400)
    }

    // Validate request body
    const validation = updatePaymentSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    const payment = await PaymentModel.updateById(id, validation.data)
    if (!payment) {
      return createErrorResponse('Payment not found', 404)
    }

    return createSuccessResponse(payment, 'Payment updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}