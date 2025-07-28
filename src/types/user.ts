import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  name: string
  walletAddress?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRequest {
  email: string
  name: string
  walletAddress?: string
}

export interface UpdateUserRequest {
  name?: string
  walletAddress?: string
}

export type UserWithoutId = Omit<User, '_id'>
export type UserUpdate = Partial<Pick<User, 'name' | 'walletAddress' | 'updatedAt'>>