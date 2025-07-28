import { NextRequest } from 'next/server'
import { UserModel } from './models/user'
import { ProductModel } from './models/product'
import { PaymentModel } from './models/payment'
import { validateOrigin, validateUserAccess, sanitizeUserData } from './security'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user'
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/product'
import type { Payment, CreatePaymentRequest, PaymentWithProduct } from '../types/payment'

export class SecureUserModel {
  static async findByEmailSecure(email: string, request: NextRequest): Promise<User | null> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    const user = await UserModel.findByEmail(email)
    return user ? sanitizeUserData(user) : null
  }
  
  static async findByIdSecure(id: string, request: NextRequest, requestingUserId?: string): Promise<User | null> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(id, requestingUserId)) {
      throw new Error('Forbidden: Cannot access other user data')
    }
    
    const user = await UserModel.findById(id)
    return user ? sanitizeUserData(user) : null
  }
  
  static async createSecure(userData: CreateUserRequest, request: NextRequest): Promise<User> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    const user = await UserModel.create(userData)
    return sanitizeUserData(user)
  }
  
  static async updateByIdSecure(id: string, updates: UpdateUserRequest, request: NextRequest, requestingUserId?: string): Promise<User | null> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(id, requestingUserId)) {
      throw new Error('Forbidden: Cannot update other user data')
    }
    
    const user = await UserModel.updateById(id, updates)
    return user ? sanitizeUserData(user) : null
  }
}

export class SecureProductModel {
  static async findBySellerSecure(sellerId: string, request: NextRequest, requestingUserId?: string): Promise<Product[]> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(sellerId, requestingUserId)) {
      throw new Error('Forbidden: Cannot access other user products')
    }
    
    return await ProductModel.findBySeller(sellerId)
  }
  
  static async createSecure(sellerId: string, productData: CreateProductRequest, request: NextRequest, requestingUserId?: string): Promise<Product> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(sellerId, requestingUserId)) {
      throw new Error('Forbidden: Cannot create products for other users')
    }
    
    return await ProductModel.create(sellerId, productData)
  }
  
  static async updateByIdSecure(id: string, updates: UpdateProductRequest, request: NextRequest, requestingUserId?: string): Promise<Product | null> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    // First get the product to check ownership
    const product = await ProductModel.findById(id)
    if (!product) {
      return null
    }
    
    if (!validateUserAccess(product.sellerId.toString(), requestingUserId)) {
      throw new Error('Forbidden: Cannot update other user products')
    }
    
    return await ProductModel.updateById(id, updates)
  }
  
  static async deleteByIdSecure(id: string, request: NextRequest, requestingUserId?: string): Promise<boolean> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    // First get the product to check ownership
    const product = await ProductModel.findById(id)
    if (!product) {
      return false
    }
    
    if (!validateUserAccess(product.sellerId.toString(), requestingUserId)) {
      throw new Error('Forbidden: Cannot delete other user products')
    }
    
    return await ProductModel.deleteById(id)
  }
  
  // Public methods (for payment pages) - no user validation needed
  static async findActiveByPaymentLinkSecure(paymentLink: string, request: NextRequest): Promise<Product | null> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    return await ProductModel.findActiveByPaymentLink(paymentLink)
  }
}

export class SecurePaymentModel {
  static async findBySellerSecure(sellerId: string, request: NextRequest, requestingUserId?: string): Promise<Payment[]> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(sellerId, requestingUserId)) {
      throw new Error('Forbidden: Cannot access other user payments')
    }
    
    return await PaymentModel.findBySeller(sellerId)
  }
  
  static async createSecure(paymentData: CreatePaymentRequest, request: NextRequest): Promise<Payment> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    return await PaymentModel.create(paymentData)
  }
  
  static async getSellerEarningsSecure(sellerId: string, request: NextRequest, requestingUserId?: string): Promise<{ totalEarnings: number, totalSales: number }> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(sellerId, requestingUserId)) {
      throw new Error('Forbidden: Cannot access other user earnings')
    }
    
    return await PaymentModel.getSellerEarnings(sellerId)
  }
  
  static async findWithProductSecure(sellerId: string, request: NextRequest, requestingUserId?: string): Promise<PaymentWithProduct[]> {
    if (!validateOrigin(request)) {
      throw new Error('Unauthorized access')
    }
    
    if (!validateUserAccess(sellerId, requestingUserId)) {
      throw new Error('Forbidden: Cannot access other user payment history')
    }
    
    return await PaymentModel.findWithProduct(sellerId)
  }
}