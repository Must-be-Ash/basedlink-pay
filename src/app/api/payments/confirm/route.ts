import { NextRequest } from 'next/server'
import { PaymentModel } from '@/lib/models/payment'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'
import { verifyUSDCTransaction, isValidTransactionHash } from '@/lib/blockchain-verification'

// POST /api/payments/confirm - Confirm payment with blockchain verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionHash, paymentId } = body

    // Validate required fields
    if (!transactionHash) {
      return createErrorResponse('Transaction hash is required', 400)
    }

    if (!paymentId) {
      return createErrorResponse('Payment ID is required', 400)
    }

    // Validate transaction hash format
    if (!isValidTransactionHash(transactionHash)) {
      return createErrorResponse('Invalid transaction hash format', 400)
    }

    // Check if transaction hash is already used (prevent double-spend)
    const isUsed = await PaymentModel.isTransactionHashUsed(transactionHash)
    if (isUsed) {
      return createErrorResponse('Transaction hash already used', 409)
    }

    // Get the payment record
    const payment = await PaymentModel.findById(paymentId)
    if (!payment) {
      return createErrorResponse('Payment not found', 404)
    }

    // Get the product to verify payment details
    const product = await ProductModel.findById(payment.productId.toString())
    if (!product) {
      return createErrorResponse('Associated product not found', 404)
    }

    // Determine the expected recipient address
    const expectedRecipient = product.recipientAddress || product.ownerAddress
    if (!expectedRecipient) {
      return createErrorResponse('No recipient address configured for product', 500)
    }

    // Verify the transaction on blockchain
    console.log('🔍 Verifying blockchain transaction:', {
      transactionHash,
      expectedAmount: product.priceUSDC.toString(),
      expectedRecipient,
      productId: product._id?.toString()
    })

    const verificationResult = await verifyUSDCTransaction(
      transactionHash,
      product.priceUSDC.toString(),
      expectedRecipient,
      1 // Require 1 confirmation (reduced for better UX)
    )

    if (!verificationResult.isValid) {
      console.error('❌ Transaction verification failed:', verificationResult.error)
      return createErrorResponse(
        `Payment verification failed: ${verificationResult.error}`,
        400
      )
    }

    console.log('✅ Transaction verified successfully:', {
      actualAmount: verificationResult.actualAmount,
      actualRecipient: verificationResult.actualRecipient,
      confirmations: verificationResult.confirmations
    })

    // Update payment with verified transaction details
    const confirmedPayment = await PaymentModel.updateById(paymentId, {
      transactionHash,
      status: 'completed',
      amountUSDC: parseFloat(verificationResult.actualAmount),
      toAddress: verificationResult.actualRecipient,
      completedAt: new Date()
    })

    if (!confirmedPayment) {
      return createErrorResponse('Failed to update payment status', 500)
    }

    return createSuccessResponse({
      payment: confirmedPayment,
      verification: {
        blockNumber: verificationResult.blockNumber,
        confirmations: verificationResult.confirmations,
        actualAmount: verificationResult.actualAmount,
        actualRecipient: verificationResult.actualRecipient
      }
    }, 'Payment verified and confirmed successfully')

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return handleApiError(error)
  }
}