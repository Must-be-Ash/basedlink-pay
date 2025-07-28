export function validateDatabaseConfig() {
  const requiredVars = ['MONGODB_URI']
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI!,
    dbName: 'crypto-stripe-link'
  },
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
} as const