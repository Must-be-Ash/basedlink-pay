import { getDatabase } from '@/lib/mongodb'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils'

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    // Check database connection
    const db = await getDatabase()
    await db.admin().ping()

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running',
      },
    }

    return createSuccessResponse(health)
  } catch {
    return createErrorResponse('Service unhealthy', 503)
  }
}