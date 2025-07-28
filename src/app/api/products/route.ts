import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { createProductSchema } from '@/lib/validation'

// GET /api/products - Get user's products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return createErrorResponse('sellerId is required', 400)
    }

    if (!validateObjectId(sellerId)) {
      return createErrorResponse('Invalid sellerId format', 400)
    }

    const products = await ProductModel.findBySeller(sellerId)
    return createSuccessResponse(products)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = createProductSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    const { sellerId } = body

    if (!sellerId) {
      return createErrorResponse('sellerId is required', 400)
    }

    if (!validateObjectId(sellerId)) {
      return createErrorResponse('Invalid sellerId format', 400)
    }

    const product = await ProductModel.create(sellerId, validation.data)
    return createSuccessResponse(product, 'Product created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}