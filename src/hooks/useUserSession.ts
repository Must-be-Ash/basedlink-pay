"use client"

import { useEffect, useState } from "react"
import { useCurrentUser, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks"
import type { User } from "@/types/user"
import type { CDPUser } from "@/types/cdp"

export function useUserSession() {
  const isInitialized = useIsInitialized()
  const currentUser = useCurrentUser()
  const evmAddress = useEvmAddress()
  
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized) return

    if (!currentUser || !evmAddress) {
      setDbUser(null)
      setIsLoading(false)
      return
    }

    const syncUserToDatabase = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Find or create user via API
        const userEmail = (currentUser as CDPUser)?.email || 'unknown@email.com'
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            name: userEmail.split('@')[0], // Use email prefix as default name
            walletAddress: evmAddress,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to sync user')
        }

        const { data: user } = await response.json()
        setDbUser(user)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to sync user"
        setError(errorMsg)
        console.error("User sync error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    syncUserToDatabase()
  }, [isInitialized, currentUser, evmAddress])

  const updateUser = async (updates: { name?: string }) => {
    if (!dbUser?._id) return null

    try {
      const response = await fetch(`/api/users/${dbUser._id.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const { data: updatedUser } = await response.json()
      if (updatedUser) {
        setDbUser(updatedUser)
      }
      return updatedUser
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update user"
      setError(errorMsg)
      throw err
    }
  }

  return {
    user: dbUser,
    cdpUser: currentUser,
    walletAddress: evmAddress,
    isLoading,
    error,
    isAuthenticated: !!(currentUser && evmAddress && dbUser),
    updateUser,
  }
}