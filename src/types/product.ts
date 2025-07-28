import { ObjectId } from 'mongodb'

export interface Product {
  _id?: ObjectId
  sellerId: ObjectId
  name: string
  description: string
  priceUSD: number
  priceUSDC: number
  imageUrl?: string
  isActive: boolean
  status: 'active' | 'inactive'
  paymentLink: string
  slug: string
  recipientAddress?: string
  ownerAddress: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductRequest {
  name: string
  description: string
  priceUSD: number
  imageUrl?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  priceUSD?: number
  imageUrl?: string
  isActive?: boolean
  recipientAddress?: string
}

export interface ProductWithSeller extends Product {
  seller: {
    _id: ObjectId
    username: string
    name: string
    email: string
    walletAddress?: string
  }
}

export type ProductUpdate = Partial<Pick<Product, 'name' | 'description' | 'priceUSD' | 'priceUSDC' | 'imageUrl' | 'isActive' | 'recipientAddress' | 'slug' | 'paymentLink' | 'updatedAt'>>