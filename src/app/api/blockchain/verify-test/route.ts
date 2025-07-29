import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils'
import { verifyUSDCTransaction, getTransactionDetails, isValidTransactionHash } from '@/lib/blockchain-verification'

// POST /api/blockchain/verify-test - Test blockchain verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionHash, expectedAmount, expectedRecipient } = body

    // Validate inputs
    if (!transactionHash || !expectedAmount || !expectedRecipient) {
      return createErrorResponse('Missing required fields: transactionHash, expectedAmount, expectedRecipient', 400)
    }

    if (!isValidTransactionHash(transactionHash)) {
      return createErrorResponse('Invalid transaction hash format', 400)
    }

    console.log('🧪 Testing blockchain verification:', {
      transactionHash,
      expectedAmount,
      expectedRecipient
    })

    // Test verification
    const verificationResult = await verifyUSDCTransaction(
      transactionHash,
      expectedAmount,
      expectedRecipient,
      1 // Only require 1 confirmation for testing
    )

    // Get additional transaction details for debugging
    let transactionDetails = null
    try {
      transactionDetails = await getTransactionDetails(transactionHash)
    } catch (detailError) {
      console.warn('Could not get transaction details:', detailError)
    }

    return createSuccessResponse({
      verification: verificationResult,
      transactionDetails: transactionDetails ? {
        blockNumber: transactionDetails.transaction?.blockNumber,
        value: transactionDetails.transaction?.value,
        to: transactionDetails.transaction?.to,
        from: transactionDetails.transaction?.from,
        status: transactionDetails.receipt?.status,
        gasUsed: transactionDetails.receipt?.gasUsed,
        logs: transactionDetails.receipt?.logs?.length
      } : null
    }, verificationResult.isValid ? 'Transaction verified successfully' : 'Transaction verification failed')

  } catch (error) {
    console.error('Blockchain verification test error:', error)
    return handleApiError(error)
  }
}

// GET /api/blockchain/verify-test - Get verification status
export async function GET() {
  try {
    const hasAlchemyKey = !!process.env.ALCHEMY_API_KEY
    const alchemyKeyLength = process.env.ALCHEMY_API_KEY?.length || 0
    
    return createSuccessResponse({
      configured: hasAlchemyKey,
      alchemyKeyLength: hasAlchemyKey ? alchemyKeyLength : 0,
      network: 'Base Mainnet',
      usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      ready: hasAlchemyKey
    }, hasAlchemyKey ? 'Blockchain verification is ready' : 'Alchemy API key not configured')

  } catch (error) {
    return handleApiError(error)
  }
}