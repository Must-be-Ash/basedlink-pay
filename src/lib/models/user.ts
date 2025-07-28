import { ObjectId } from 'mongodb'
import { getDatabase, COLLECTIONS } from '../mongodb'
import type { User, CreateUserRequest, UpdateUserRequest, UserUpdate } from '../../types/user'

export class UserModel {
  static async create(userData: CreateUserRequest): Promise<User> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    const user: User = {
      ...userData,
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

  static async findById(id: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    
    return await collection.findOne({ _id: new ObjectId(id) })
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
      user = await this.create({ email, name, walletAddress })
    } else if (walletAddress && user.walletAddress !== walletAddress) {
      user = await this.updateWalletAddress(email, walletAddress)
    }
    
    return user!
  }
}