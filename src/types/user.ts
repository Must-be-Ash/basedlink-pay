import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  username: string // Unique identifier for public profile
  name: string // Display name (can be same as others)
  bio?: string
  profileImageUrl?: string
  walletAddress?: string
  isOnboardingComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRequest {
  email: string
  username: string
  name: string
  bio?: string
  profileImageUrl?: string
  walletAddress?: string
}

export interface UpdateUserRequest {
  username?: string
  name?: string
  bio?: string
  profileImageUrl?: string
  walletAddress?: string
  isOnboardingComplete?: boolean
}

export interface OnboardingRequest {
  username: string
  name: string
  bio?: string
  profileImage?: File
}

export type UserWithoutId = Omit<User, '_id'>
export type UserUpdate = Partial<Pick<User, 'username' | 'name' | 'bio' | 'profileImageUrl' | 'walletAddress' | 'isOnboardingComplete' | 'updatedAt'>>