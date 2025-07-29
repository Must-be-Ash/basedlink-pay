// Run this script to create database indexes
// Usage: node scripts/create-indexes.js

require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI

async function createIndexes() {
  if (!uri) {
    console.error('MONGODB_URI environment variable is required')
    process.exit(1)
  }

  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('crypto-stripe-link')
    
    // Users collection indexes
    const usersCollection = db.collection('users')
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ walletAddress: 1 })
    await usersCollection.createIndex({ createdAt: -1 })
    
    // Products collection indexes
    const productsCollection = db.collection('products')
    await productsCollection.createIndex({ sellerId: 1, createdAt: -1 })
    await productsCollection.createIndex({ paymentLink: 1 }, { unique: true })
    await productsCollection.createIndex({ isActive: 1 })
    await productsCollection.createIndex({ createdAt: -1 })
    
    // Payments collection indexes
    const paymentsCollection = db.collection('payments')
    
    // Drop existing transactionHash index if it exists (to fix duplicate null issue)
    try {
      await paymentsCollection.dropIndex('transactionHash_1')
      console.log('Dropped existing transactionHash index')
    } catch (error) {
      // Index might not exist, continue
      console.log('transactionHash index does not exist or already dropped')
    }
    
    await paymentsCollection.createIndex({ sellerId: 1, createdAt: -1 })
    await paymentsCollection.createIndex({ productId: 1, createdAt: -1 })
    await paymentsCollection.createIndex({ transactionHash: 1 }, { unique: true, sparse: true })
    await paymentsCollection.createIndex({ buyerEmail: 1 })
    await paymentsCollection.createIndex({ status: 1 })
    await paymentsCollection.createIndex({ createdAt: -1 })
    
    console.log('Database indexes created successfully')
  } catch (error) {
    console.error('Error creating indexes:', error)
  } finally {
    await client.close()
  }
}

createIndexes()