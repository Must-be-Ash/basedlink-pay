import { ObjectId } from 'mongodb'
import { getDatabase, COLLECTIONS } from '../mongodb'
import type { Payment, CreatePaymentRequest, UpdatePaymentRequest, PaymentUpdate, PaymentWithProduct } from '../../types/payment'

export class PaymentModel {
  static async create(paymentData: CreatePaymentRequest): Promise<Payment> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    // Get product to get seller ID
    const productsCollection = db.collection(COLLECTIONS.PRODUCTS)
    const product = await productsCollection.findOne({ _id: new ObjectId(paymentData.productId) })
    
    if (!product) {
      throw new Error('Product not found')
    }
    
    const payment: Payment = {
      productId: new ObjectId(paymentData.productId),
      sellerId: product.sellerId,
      buyerEmail: paymentData.buyerEmail,
      buyerWalletAddress: paymentData.buyerWalletAddress,
      amountUSD: product.priceUSD,
      amountUSDC: paymentData.amountUSDC,
      fromAddress: paymentData.buyerWalletAddress,
      toAddress: product.ownerAddress || '',
      transactionHash: paymentData.transactionHash,
      status: 'pending',
      createdAt: new Date(),
    }
    
    const result = await collection.insertOne(payment)
    return { ...payment, _id: result.insertedId }
  }

  static async findById(id: string): Promise<Payment | null> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findByTransactionHash(transactionHash: string): Promise<Payment | null> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    return await collection.findOne({ transactionHash })
  }

  static async findBySeller(sellerId: string): Promise<Payment[]> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    return await collection
      .find({ sellerId: new ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .toArray()
  }

  static async findByProduct(productId: string): Promise<Payment[]> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    return await collection
      .find({ productId: new ObjectId(productId) })
      .sort({ createdAt: -1 })
      .toArray()
  }

  static async updateById(id: string, updates: UpdatePaymentRequest): Promise<Payment | null> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    const updateData: PaymentUpdate = { ...updates }
    
    if (updates.status === 'completed' && !updates.completedAt) {
      updateData.completedAt = new Date()
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    return result
  }

  static async markCompleted(transactionHash: string): Promise<Payment | null> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    const result = await collection.findOneAndUpdate(
      { transactionHash },
      { 
        $set: { 
          status: 'completed', 
          completedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    )
    
    return result
  }

  static async getSellerEarnings(sellerId: string): Promise<{ totalEarnings: number, totalSales: number }> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    const result = await collection.aggregate<{ _id: null, totalEarnings: number, totalSales: number }>([
      { 
        $match: { 
          sellerId: new ObjectId(sellerId),
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amountUSDC' },
          totalSales: { $sum: 1 }
        }
      }
    ]).toArray()
    
    const earnings = result[0]
    return earnings ? { totalEarnings: earnings.totalEarnings, totalSales: earnings.totalSales } : { totalEarnings: 0, totalSales: 0 }
  }

  static async findWithProduct(sellerId: string): Promise<PaymentWithProduct[]> {
    const db = await getDatabase()
    const collection = db.collection<Payment>(COLLECTIONS.PAYMENTS)
    
    const result = await collection.aggregate<PaymentWithProduct>([
      { $match: { sellerId: new ObjectId(sellerId) } },
      {
        $lookup: {
          from: COLLECTIONS.PRODUCTS,
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 1,
          productId: 1,
          sellerId: 1,
          buyerEmail: 1,
          buyerWalletAddress: 1,
          amountUSDC: 1,
          transactionHash: 1,
          status: 1,
          createdAt: 1,
          completedAt: 1,
          'product._id': 1,
          'product.name': 1,
          'product.description': 1,
          'product.priceUSD': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray()
    
    return result
  }
}