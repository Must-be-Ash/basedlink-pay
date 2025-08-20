import { NextRequest, NextResponse } from 'next/server'
import type { User } from '../types/user'

// Allowed origins for your application
const ALLOWED_ORIGINS = [
  'https://stablelink.xyz',
  'https://www.stablelink.xyz',
  // Add development origins
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Add Vercel preview URLs if needed
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean)

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // For same-origin requests (like server-side), origin might be null
  if (!origin && !referer) {
    // Allow same-origin requests (from your own domain)
    const host = request.headers.get('host')
    return host?.includes('stablelink.xyz') || host?.includes('localhost') || host?.includes('127.0.0.1') || false
  }
  
  // Check origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true
  }
  
  // Check referer as fallback
  if (referer) {
    return ALLOWED_ORIGINS.some(allowedOrigin => referer.startsWith(allowedOrigin))
  }
  
  return false
}

export function createCorsHeaders(origin?: string | null): Headers {
  const headers = new Headers()
  
  // Only set CORS headers for allowed origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
  } else {
    // Default to your main domain
    headers.set('Access-Control-Allow-Origin', 'https://stablelink.xyz')
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Max-Age', '86400') // 24 hours
  
  return headers
}

export function withSecurity(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate origin
    if (!validateOrigin(request)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'Access denied from this origin' 
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin')
      const corsHeaders = createCorsHeaders(origin)
      return new NextResponse(null, { status: 200, headers: corsHeaders })
    }
    
    // Call the actual handler
    const response = await handler(request)
    
    // Add CORS headers to the response
    const origin = request.headers.get('origin')
    const corsHeaders = createCorsHeaders(origin)
    
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

export function validateUserAccess(userId: string, requestedUserId?: string): boolean {
  // Users can only access their own data
  if (requestedUserId && userId !== requestedUserId) {
    return false
  }
  return true
}

export function sanitizeUserData(user: User) {
  // Remove sensitive fields before sending to client
  const { 
    _id, 
    email, 
    username,
    name, 
    bio,
    profileImageUrl,
    walletAddress, 
    isOnboardingComplete,
    createdAt, 
    updatedAt 
  } = user
  
  return { 
    _id, 
    email, 
    username,
    name, 
    bio,
    profileImageUrl,
    walletAddress, 
    isOnboardingComplete,
    createdAt, 
    updatedAt 
  }
}

export function validateApiKey(request: NextRequest): boolean {
  // Optional: Add API key validation for server-to-server requests
  const apiKey = request.headers.get('x-api-key')
  const validApiKey = process.env.API_KEY
  
  if (validApiKey && apiKey === validApiKey) {
    return true
  }
  
  // If no API key is configured, fall back to origin validation
  return validateOrigin(request)
}