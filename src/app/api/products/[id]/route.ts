import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { updateProductSchema } from '@/lib/validation'

// GET /api/products/[id] - Get specific product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    const product = await ProductModel.findById(id)
    if (!product) {
      return createErrorResponse('Product not found', 404)
    }

    return createSuccessResponse(product)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    // Validate request body
    const validation = updateProductSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    const product = await ProductModel.updateById(id, validation.data)
    if (!product) {
      return createErrorResponse('Product not found', 404)
    }

    return createSuccessResponse(product, 'Product updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!validateObjectId(id)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    const deleted = await ProductModel.deleteById(id)
    if (!deleted) {
      return createErrorResponse('Product not found', 404)
    }

    return createSuccessResponse(null, 'Product deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}