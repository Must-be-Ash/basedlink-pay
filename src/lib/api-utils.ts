import { NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function createErrorResponse(error: string, status: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
  }, { status })
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    // Known error types
    if (error.message.includes('duplicate key')) {
      return createErrorResponse('Resource already exists', 409)
    }
    if (error.message.includes('not found')) {
      return createErrorResponse('Resource not found', 404)
    }
    if (error.message.includes('validation')) {
      return createErrorResponse(error.message, 400)
    }
    
    return createErrorResponse(error.message, 500)
  }
  
  return createErrorResponse('Internal server error', 500)
}

export function validateRequiredFields(data: Record<string, unknown>, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return `${field} is required`
    }
  }
  return null
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}