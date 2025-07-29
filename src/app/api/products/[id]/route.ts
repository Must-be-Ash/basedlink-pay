import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/product'
import { createSuccessResponse, createErrorResponse, handleApiError, validateObjectId } from '@/lib/api-utils'
import { updateProductSchema } from '@/lib/validation'
import { withProductOwnership } from '@/lib/middleware-auth'
import { requireAuth } from '@/lib/auth'
import type { User } from '@/types/user'

// GET /api/products/[id] - Get specific product (owner access only)
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

    // Try to authenticate the user
    const user = await requireAuth(request)
    
    // If no authentication or user doesn't own the product, deny access
    if (!user || product.sellerId.toString() !== user._id!.toString()) {
      return createErrorResponse('Product not found', 404) // Return 404 instead of 403 to not reveal product existence
    }

    return createSuccessResponse(product)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/products/[id] - Update product (requires ownership)
export const PUT = withProductOwnership(async (
  request: NextRequest,
  user: User,
  productId: string
) => {
  try {
    const body = await request.json()

    if (!validateObjectId(productId)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    // Validate request body
    const validation = updateProductSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(validation.error.errors[0].message, 400)
    }

    // Critical security check: Ensure user owns the product before updating
    const existingProduct = await ProductModel.findById(productId)
    if (!existingProduct) {
      return createErrorResponse('Product not found', 404)
    }

    if (existingProduct.sellerId.toString() !== user._id!.toString()) {
      return createErrorResponse('Forbidden: You do not own this product', 403)
    }

    // Prevent tampering with critical fields
    const safeUpdates = { ...validation.data }
    delete (safeUpdates as Record<string, unknown>).sellerId // Never allow changing product owner
    delete (safeUpdates as Record<string, unknown>)._id      // Never allow changing ID

    const product = await ProductModel.updateById(productId, safeUpdates)
    if (!product) {
      return createErrorResponse('Product not found', 404)
    }

    return createSuccessResponse(product, 'Product updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
})

// DELETE /api/products/[id] - Delete product (requires ownership)
export const DELETE = withProductOwnership(async (
  request: NextRequest,
  user: User,
  productId: string
) => {
  try {
    if (!validateObjectId(productId)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    // Additional security check: Verify product ownership before deletion
    const existingProduct = await ProductModel.findById(productId)
    if (!existingProduct) {
      return createErrorResponse('Product not found', 404)
    }

    if (existingProduct.sellerId.toString() !== user._id!.toString()) {
      return createErrorResponse('Forbidden: You do not own this product', 403)
    }

    const deleted = await ProductModel.deleteById(productId)
    if (!deleted) {
      return createErrorResponse('Product not found', 404)
    }

    return createSuccessResponse(null, 'Product deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
})