// Helper functions for testing API routes
export const testData = {
  validUser: {
    email: 'test@example.com',
    name: 'Test User',
    walletAddress: '0x1234567890123456789012345678901234567890',
  },
  
  validProduct: {
    name: 'Test Product',
    description: 'A test product for development',
    priceUSD: 9.99,
    imageUrl: 'https://example.com/image.jpg',
    recipientAddress: '0x1234567890123456789012345678901234567890',
    slug: 'test-product',
  },
  
  validPayment: {
    buyerEmail: 'buyer@example.com',
    buyerWalletAddress: '0x0987654321098765432109876543210987654321',
    amountUSD: 9.99,
    amountUSDC: 9.99,
    fromAddress: '0x0987654321098765432109876543210987654321',
    toAddress: '0x1234567890123456789012345678901234567890',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  },
}

export function createMockRequest(body?: unknown, searchParams?: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/test')
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  return {
    json: () => Promise.resolve(body),
    nextUrl: url,
  } as unknown
}

export function validateApiResponse(response: unknown): boolean {
  // Check if response has required structure
  if (typeof response !== 'object' || response === null) {
    return false
  }
  
  const apiResponse = response as Record<string, unknown>
  
  // Must have success field
  if (typeof apiResponse.success !== 'boolean') {
    return false
  }
  
  // If success is true, should have data
  if (apiResponse.success && !apiResponse.data) {
    return false
  }
  
  // If success is false, should have error
  if (!apiResponse.success && !apiResponse.error) {
    return false
  }
  
  return true
}

export const mockObjectId = '507f1f77bcf86cd799439011'

export function generateMockTransactionHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

export function generateMockWalletAddress(): string {
  return '0x' + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}