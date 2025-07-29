import { ObjectId } from 'mongodb'

export type PaymentStatus = 'pending' | 'completed' | 'failed'

export interface Payment {
  _id?: ObjectId
  productId: ObjectId
  sellerId: ObjectId
  buyerEmail: string
  buyerWalletAddress: string
  amountUSD: number
  amountUSDC: number
  fromAddress: string
  toAddress: string
  transactionHash?: string
  status: PaymentStatus
  errorMessage?: string
  createdAt: Date
  completedAt?: Date
}

export interface CreatePaymentRequest {
  productId: string
  buyerEmail: string
  buyerWalletAddress: string
  amountUSDC: number
  transactionHash?: string
}

export interface UpdatePaymentRequest {
  status?: PaymentStatus
  completedAt?: Date
  transactionHash?: string
  amountUSDC?: number
  toAddress?: string
}

export interface PaymentWithProduct extends Payment {
  product: {
    _id: ObjectId
    name: string
    description: string
    priceUSD: number
  }
}

export type PaymentUpdate = Partial<Pick<Payment, 'status' | 'completedAt' | 'transactionHash' | 'amountUSDC' | 'toAddress'>>