import { NextRequest, NextResponse } from 'next/server'

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
    const CDP_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID

    if (!CDP_PROJECT_ID) {
      return NextResponse.json(
        { error: 'CDP Project ID not configured' },
        { status: 500 }
      )
    }

    // For now, create a session token directly using the CDP Project ID
    // This is a temporary solution until we can properly implement CDP SDK JWT
    const sessionTokenRequest = guestCheckout 
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

    // Try using CDP Project ID as authorization (temporary approach)
    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CDP_PROJECT_ID}`,
      },
      body: JSON.stringify(sessionTokenRequest)
    })

    if (!response.ok) {
      // If CDP API fails, create a mock session token for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('CDP API failed, using mock session token for development')
        
        // Create a mock session token for development
        const mockToken = Buffer.from(JSON.stringify({
          userAddress: guestCheckout ? null : userAddress,
          timestamp: Date.now(),
          expiresAt: Date.now() + (5 * 60 * 1000),
          guestCheckout: !!guestCheckout
        })).toString('base64')

        return NextResponse.json({
          success: true,
          data: {
            token: mockToken,
            channelId: `mock_${Date.now()}`,
            expiresAt: Date.now() + (5 * 60 * 1000)
          }
        })
      }

      const errorText = await response.text()
      console.error('CDP API error:', response.status, errorText)
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