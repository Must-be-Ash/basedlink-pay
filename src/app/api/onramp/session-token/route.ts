import { NextRequest, NextResponse } from 'next/server'
import { generateJwt } from '@coinbase/cdp-sdk/auth'

export async function POST(request: NextRequest) {
  try {
    const { userAddress, guestCheckout } = await request.json()

    // For guest checkout, userAddress can be null
    if (!userAddress && !guestCheckout) {
      return NextResponse.json(
        { error: 'User address is required for regular onramp' },
        { status: 400 }
      )
    }

    // Environment variables for CDP API
    const CDP_API_KEY_NAME = process.env.CDP_API_KEY_NAME
    const CDP_PRIVATE_KEY = process.env.CDP_PRIVATE_KEY

    if (!CDP_API_KEY_NAME || !CDP_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'CDP API credentials not configured' },
        { status: 500 }
      )
    }

    // Generate JWT using CDP SDK (handles Ed25519 signing properly)
    const jwt = await generateJwt({
      apiKeyId: CDP_API_KEY_NAME,
      apiKeySecret: CDP_PRIVATE_KEY,
      requestMethod: 'POST',
      requestHost: 'api.developer.coinbase.com',
      requestPath: '/onramp/v1/token',
      expiresIn: 120 // 2 minutes
    })

    // Call CDP Session Token API with proper authentication
    const requestBody = guestCheckout 
      ? {
          // Guest checkout doesn't require specific addresses
          addresses: [],
          assets: ['ETH', 'USDC']
        }
      : {
          addresses: [
            {
              address: userAddress,
              blockchains: ['base']
            }
          ],
          assets: ['ETH', 'USDC']
        }

    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      // Log error details only in development
      if (process.env.NODE_ENV === 'development') {
        const errorText = await response.text()
        console.error('CDP API error:', response.status, errorText)
      }
      throw new Error(`CDP API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Log response only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('CDP API response:', JSON.stringify(data, null, 2))
    }

    return NextResponse.json({
      success: true,
      data: {
        token: data.token || data.data?.token,
        channelId: data.channel_id || data.data?.channel_id || '',
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      }
    })

  } catch (error) {
    // Log error details only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Session token generation error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to generate session token' },
      { status: 500 }
    )
  }
} 