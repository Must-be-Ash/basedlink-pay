import { ObjectId } from 'mongodb'
import { getDatabase, COLLECTIONS } from '../mongodb'
import type { Product, CreateProductRequest, UpdateProductRequest, ProductUpdate, ProductWithSeller } from '../../types/product'
import { generateSlug } from '../utils'

// USDC conversion rate (simplified - in production, use real-time rates)
const USD_TO_USDC_RATE = 1.0

export class ProductModel {
  static async create(sellerId: string, productData: CreateProductRequest & { recipientAddress?: string }): Promise<Product> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    const baseSlug = generateSlug(productData.name)
    let paymentLink = baseSlug
    let counter = 1
    
    // Ensure unique payment link
    while (await this.findByPaymentLink(paymentLink)) {
      paymentLink = `${baseSlug}-${counter}`
      counter++
    }
    
    const product: Product = {
      ...productData,
      sellerId: new ObjectId(sellerId),
      priceUSDC: productData.priceUSD * USD_TO_USDC_RATE,
      isActive: true,
      status: 'active',
      slug: paymentLink,
      paymentLink,
      recipientAddress: productData.recipientAddress,
      ownerAddress: productData.recipientAddress || '', // Use recipientAddress as fallback
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await collection.insertOne(product)
    return { ...product, _id: result.insertedId }
  }

  static async findById(id: string): Promise<Product | null> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findByPaymentLink(paymentLink: string): Promise<Product | null> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    return await collection.findOne({ paymentLink })
  }

  static async findBySeller(sellerId: string): Promise<Product[]> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    return await collection
      .find({ sellerId: new ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .toArray()
  }

  static async updateById(id: string, updates: UpdateProductRequest): Promise<Product | null> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    const updateData: ProductUpdate = {
      ...updates,
      updatedAt: new Date(),
    }
    
    // Update USDC price if USD price is updated
    if (updates.priceUSD !== undefined) {
      updateData.priceUSDC = updates.priceUSD * USD_TO_USDC_RATE
    }

    // Update ownerAddress when recipientAddress is updated for consistency
    if (updates.recipientAddress !== undefined) {
      updateData.recipientAddress = updates.recipientAddress
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    return result
  }

  static async deleteById(id: string): Promise<boolean> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async findWithSeller(id: string): Promise<ProductWithSeller | null> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    const result = await collection.aggregate<ProductWithSeller>([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      {
        $unwind: '$seller'
      },
      {
        $project: {
          _id: 1,
          sellerId: 1,
          name: 1,
          description: 1,
          priceUSD: 1,
          priceUSDC: 1,
          imageUrl: 1,
          isActive: 1,
          status: 1,
          paymentLink: 1,
          slug: 1,
          recipientAddress: 1,
          ownerAddress: 1,
          createdAt: 1,
          updatedAt: 1,
          'seller._id': 1,
          'seller.name': 1,
          'seller.email': 1,
          'seller.walletAddress': 1
        }
      }
    ]).toArray()
    
    return result[0] || null
  }

  static async findActiveByPaymentLink(paymentLink: string): Promise<Product | null> {
    const db = await getDatabase()
    const collection = db.collection<Product>(COLLECTIONS.PRODUCTS)
    
    return await collection.findOne({ 
      paymentLink, 
      isActive: true 
    })
  }
}