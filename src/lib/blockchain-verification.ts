import { ethers } from 'ethers'

// Base network configuration
const BASE_RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base

// USDC Contract ABI - just the Transfer event we need
const USDC_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
]

export interface TransactionVerificationResult {
  isValid: boolean
  actualAmount: string
  actualRecipient: string
  blockNumber: number
  confirmations: number
  error?: string
}

export class BlockchainVerificationError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'BlockchainVerificationError'
  }
}

/**
 * Verify a USDC transaction on Base network
 */
export async function verifyUSDCTransaction(
  transactionHash: string,
  expectedAmount: string,
  expectedRecipient: string,
  minimumConfirmations: number = 3
): Promise<TransactionVerificationResult> {
  try {
    // Input validation
    if (!transactionHash || !ethers.isHexString(transactionHash, 32)) {
      throw new BlockchainVerificationError('Invalid transaction hash format', 'INVALID_HASH')
    }

    if (!expectedRecipient || !ethers.isAddress(expectedRecipient)) {
      throw new BlockchainVerificationError('Invalid recipient address format', 'INVALID_RECIPIENT')
    }

    const expectedAmountWei = ethers.parseUnits(expectedAmount, 6) // USDC has 6 decimals

    // Create provider
    if (!process.env.ALCHEMY_API_KEY) {
      throw new BlockchainVerificationError('Alchemy API key not configured', 'CONFIG_ERROR')
    }

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL)

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash)
    if (!receipt) {
      throw new BlockchainVerificationError('Transaction not found', 'TX_NOT_FOUND')
    }

    // Check if transaction was successful
    if (receipt.status !== 1) {
      throw new BlockchainVerificationError('Transaction failed on blockchain', 'TX_FAILED')
    }

    // Get current block number for confirmation count
    const currentBlockNumber = await provider.getBlockNumber()
    const confirmations = currentBlockNumber - receipt.blockNumber

    // Check minimum confirmations
    if (confirmations < minimumConfirmations) {
      throw new BlockchainVerificationError(
        `Transaction needs ${minimumConfirmations} confirmations, has ${confirmations}`,
        'INSUFFICIENT_CONFIRMATIONS'
      )
    }

    // Parse USDC transfer events
    const usdcInterface = new ethers.Interface(USDC_ABI)
    let transferFound = false
    let actualAmount = '0'
    let actualRecipient = ''

    for (const log of receipt.logs) {
      // Check if this log is from the USDC contract
      if (log.address.toLowerCase() !== USDC_CONTRACT_ADDRESS.toLowerCase()) {
        continue
      }

      try {
        const parsed = usdcInterface.parseLog({
          topics: log.topics,
          data: log.data
        })

        if (parsed && parsed.name === 'Transfer') {
          const to = parsed.args.to
          const value = parsed.args.value

          // Convert to USDC format (6 decimals)
          actualAmount = ethers.formatUnits(value, 6)
          actualRecipient = to

          // Check if this transfer is to our expected recipient
          if (to.toLowerCase() === expectedRecipient.toLowerCase()) {
            transferFound = true
            break
          }
        }
      } catch {
        // Skip logs that can't be parsed
        continue
      }
    }

    if (!transferFound) {
      throw new BlockchainVerificationError(
        'No USDC transfer found to expected recipient',
        'NO_TRANSFER_FOUND'
      )
    }

    // Verify amount matches (allow for small rounding differences due to decimal precision)
    const actualAmountWei = ethers.parseUnits(actualAmount, 6)
    const amountDifference = actualAmountWei > expectedAmountWei 
      ? actualAmountWei - expectedAmountWei 
      : expectedAmountWei - actualAmountWei

    // Allow up to 0.01 USDC difference for rounding
    const maxDifference = ethers.parseUnits('0.01', 6)
    
    if (amountDifference > maxDifference) {
      throw new BlockchainVerificationError(
        `Amount mismatch: expected ${expectedAmount} USDC, got ${actualAmount} USDC`,
        'AMOUNT_MISMATCH'
      )
    }

    // If amount is significantly less than expected, reject
    if (actualAmountWei < expectedAmountWei - maxDifference) {
      throw new BlockchainVerificationError(
        `Insufficient payment: expected ${expectedAmount} USDC, received ${actualAmount} USDC`,
        'INSUFFICIENT_PAYMENT'
      )
    }

    return {
      isValid: true,
      actualAmount,
      actualRecipient,
      blockNumber: receipt.blockNumber,
      confirmations
    }

  } catch (error) {
    if (error instanceof BlockchainVerificationError) {
      return {
        isValid: false,
        actualAmount: '0',
        actualRecipient: '',
        blockNumber: 0,
        confirmations: 0,
        error: error.message
      }
    }

    // Handle network errors
    if (error instanceof Error) {
      return {
        isValid: false,
        actualAmount: '0',
        actualRecipient: '',
        blockNumber: 0,
        confirmations: 0,
        error: `Network error: ${error.message}`
      }
    }

    return {
      isValid: false,
      actualAmount: '0',
      actualRecipient: '',
      blockNumber: 0,
      confirmations: 0,
      error: 'Unknown verification error'
    }
  }
}

/**
 * Get transaction details for debugging
 */
export async function getTransactionDetails(transactionHash: string) {
  try {
    if (!process.env.ALCHEMY_API_KEY) {
      throw new Error('Alchemy API key not configured')
    }

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL)
    
    const [transaction, receipt] = await Promise.all([
      provider.getTransaction(transactionHash),
      provider.getTransactionReceipt(transactionHash)
    ])

    return {
      transaction,
      receipt,
      currentBlock: await provider.getBlockNumber()
    }
  } catch (error) {
    console.error('Error getting transaction details:', error)
    throw error
  }
}

/**
 * Validate transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
  return ethers.isHexString(hash, 32)
}

/**
 * Validate wallet address format
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address)
}