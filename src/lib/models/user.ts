import { ObjectId } from 'mongodb'
import { getDatabase, COLLECTIONS } from '../mongodb'
import type { User, CreateUserRequest, UpdateUserRequest, UserUpdate } from '../../types/user'

export class UserModel {
  static async create(userData: CreateUserRequest): Promise<User> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    const user: User = {
      ...userData,
      isOnboardingComplete: false, // New users need to complete onboarding
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await collection.insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    return await collection.findOne({ email })
  }

  static async findByUsername(username: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    return await collection.findOne({ username })
  }

  static async findById(id: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    return await collection.findOne({ walletAddress })
  }

  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    const query: { username: string; _id?: { $ne: ObjectId } } = { username }
    if (excludeUserId) {
      query._id = { $ne: new ObjectId(excludeUserId) }
    }
    
    const existingUser = await collection.findOne(query)
    return !existingUser
  }

  static async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')
    let counter = 1
    
    // Ensure minimum length
    if (username.length < 3) {
      username = 'user' + username
    }
    
    // Ensure maximum length
    if (username.length > 30) {
      username = username.substring(0, 30)
    }
    
    let candidateUsername = username
    
    while (!(await this.isUsernameAvailable(candidateUsername))) {
      const suffix = counter.toString()
      const maxBaseLength = 30 - suffix.length
      const base = username.substring(0, maxBaseLength)
      candidateUsername = base + suffix
      counter++
    }
    
    return candidateUsername
  }

  static async updateById(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    const updateData: UserUpdate = {
      ...updates,
      updatedAt: new Date(),
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    return result
  }

  static async updateWalletAddress(email: string, walletAddress: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    const result = await collection.findOneAndUpdate(
      { email },
      { 
        $set: { 
          walletAddress, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    )
    
    return result
  }

  static async findOrCreate(email: string, name: string, walletAddress?: string): Promise<User> {
    let user = await this.findByEmail(email)
    
    if (!user) {
      // Generate unique username from email
      const baseUsername = email.split('@')[0]
      const uniqueUsername = await this.generateUniqueUsername(baseUsername)
      
      user = await this.create({ 
        email, 
        username: uniqueUsername,
        name, 
        walletAddress 
      })
    } else if (walletAddress && user.walletAddress !== walletAddress) {
      user = await this.updateWalletAddress(email, walletAddress)
    }
    
    return user!
  }
}