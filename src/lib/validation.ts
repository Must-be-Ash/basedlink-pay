import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional(),
})

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  priceUSD: z.number().min(0.01, 'Price must be at least $0.01').max(10000, 'Price too high'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional(),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long').optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long').optional(),
  priceUSD: z.number().min(0.01, 'Price must be at least $0.01').max(10000, 'Price too high').optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional(),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long').optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// Payment validation schemas
export const createPaymentSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  buyerEmail: z.string().email('Invalid email address'),
  buyerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  amountUSD: z.number().min(0.01, 'Amount must be positive'),
  amountUSDC: z.number().min(0.01, 'Amount must be positive'),
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
})

export const updatePaymentSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
})