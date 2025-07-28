"use client"

import { useState, useEffect, useCallback } from "react"
import { useEvmAddress } from "@coinbase/cdp-hooks"
import { 
  checkWalletBalance, 
  generateOneClickBuyURL,
  GUEST_CHECKOUT_LIMITS,
  type BalanceInfo 
} from "@/lib/onramp"

export function useWalletBalance(requiredAmount: string) {
  const evmAddress = useEvmAddress()
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    hasEnoughBalance: false,
    currentBalance: "0",
    formattedBalance: "0.00",
    isChecking: true,
  })

  const checkBalance = useCallback(async () => {
    if (!evmAddress) return
    
    setBalanceInfo(prev => ({ ...prev, isChecking: true }))
    
    try {
      const balance = await checkWalletBalance(evmAddress, requiredAmount)
      setBalanceInfo(balance)
    } catch (error) {
      console.error("Error checking balance:", error)
      setBalanceInfo({
        hasEnoughBalance: false,
        currentBalance: "0",
        formattedBalance: "0.00",
        isChecking: false,
      })
    }
  }, [evmAddress, requiredAmount])

  useEffect(() => {
    checkBalance()
  }, [checkBalance])

  return { ...balanceInfo, recheckBalance: checkBalance }
}

export function useOnramp() {
  const evmAddress = useEvmAddress()
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openOnramp = useCallback(async (usdcAmount: string) => {
    if (!evmAddress) {
      setError("No wallet address available")
      return
    }

    setIsCreatingSession(true)
    setError(null)

    try {
      // Get session token from our API endpoint
      const response = await fetch('/api/onramp/session-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: evmAddress,
          guestCheckout: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get session token')
      }

      const { data } = await response.json()
      const sessionToken = data.token

      // Generate secure onramp URL with session token
      const onrampURL = generateOneClickBuyURL(sessionToken, evmAddress, usdcAmount)
      
      // Open in new window/tab
      window.open(onrampURL, '_blank', 'noopener,noreferrer')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to open onramp"
      setError(errorMessage)
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Onramp error:", err)
      }
    } finally {
      setIsCreatingSession(false)
    }
  }, [evmAddress])

  const checkWalletBalanceAsync = useCallback(async (requiredAmount: string): Promise<BalanceInfo> => {
    return await checkWalletBalance(evmAddress, requiredAmount)
  }, [evmAddress])

  return {
    openOnramp,
    checkWalletBalance: checkWalletBalanceAsync,
    isCreatingSession,
    error,
    clearError: () => setError(null)
  }
} 