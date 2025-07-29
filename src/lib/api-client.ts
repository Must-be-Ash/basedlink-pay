/**
 * Secure API client that automatically includes authentication headers
 * This client should be used for all authenticated API requests
 */

export interface ApiClientOptions {
  userEmail?: string
  walletAddress?: string
}

export class SecureApiClient {
  private userEmail: string | null = null
  private walletAddress: string | null = null

  constructor(options?: ApiClientOptions) {
    if (options?.userEmail) this.userEmail = options.userEmail
    if (options?.walletAddress) this.walletAddress = options.walletAddress
  }

  /**
   * Set authentication credentials
   */
  setAuth(userEmail: string, walletAddress: string) {
    this.userEmail = userEmail
    this.walletAddress = walletAddress
  }

  /**
   * Clear authentication credentials
   */
  clearAuth() {
    this.userEmail = null
    this.walletAddress = null
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.userEmail && this.walletAddress) {
      headers['x-user-email'] = this.userEmail
      headers['x-wallet-address'] = this.walletAddress
    }

    return headers
  }

  /**
   * Check if client has authentication credentials
   */
  isAuthenticated(): boolean {
    return !!(this.userEmail && this.walletAddress)
  }

  /**
   * Make authenticated GET request
   */
  async get(url: string): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required: Please set email and wallet address')
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    return response
  }

  /**
   * Make authenticated POST request
   */
  async post(url: string, data?: unknown): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required: Please set email and wallet address')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return response
  }

  /**
   * Make authenticated PUT request
   */
  async put(url: string, data?: unknown): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required: Please set email and wallet address')
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return response
  }

  /**
   * Make authenticated DELETE request
   */
  async delete(url: string): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required: Please set email and wallet address')
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })

    return response
  }
}

/**
 * Create API client instance with current user credentials
 */
export function createApiClient(userEmail?: string, walletAddress?: string): SecureApiClient {
  return new SecureApiClient({ userEmail, walletAddress })
}

/**
 * Utility function for making authenticated API calls with proper error handling
 */
export async function makeAuthenticatedRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  userEmail: string,
  walletAddress: string,
  data?: unknown
): Promise<unknown> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-user-email': userEmail,
    'x-wallet-address': walletAddress,
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook to create authenticated API client with current user session
 */
export function useAuthenticatedApi(userEmail?: string, walletAddress?: string) {
  const client = new SecureApiClient()

  // Set authentication when credentials are available
  if (userEmail && walletAddress) {
    client.setAuth(userEmail, walletAddress)
  }

  return {
    client,
    isAuthenticated: client.isAuthenticated(),
    makeRequest: async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: unknown) => {
      if (!userEmail || !walletAddress) {
        throw new Error('Authentication required')
      }
      return makeAuthenticatedRequest(method, url, userEmail, walletAddress, data)
    }
  }
}