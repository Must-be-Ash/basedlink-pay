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
  const [authEmail, setAuthEmail] = useState<string | null>(null)

  // Store the email from authentication
  const setAuthenticatedEmail = (email: string) => {
    setAuthEmail(email)
    // Also store in localStorage for persistence across page reloads
    localStorage.setItem('cdp_auth_email', email)
  }

  // Load stored email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('cdp_auth_email')
    if (storedEmail && !authEmail) {
      setAuthEmail(storedEmail)
    }
  }, [authEmail])

  useEffect(() => {
    if (!isInitialized) return

    if (!currentUser || !evmAddress) {
      setDbUser(null)
      setIsLoading(false)
      // Clear stored email if user is not authenticated
      if (!currentUser) {
        setAuthEmail(null)
        localStorage.removeItem('cdp_auth_email')
      }
      return
    }

    const syncUserToDatabase = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use stored email or fallback to CDP user email or a default
        const userEmail = authEmail || 
                         (currentUser as CDPUser)?.email || 
                         'unknown@email.com'

        console.log('Syncing user with email:', userEmail) // Debug log

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
  }, [isInitialized, currentUser, evmAddress, authEmail])

  const updateUser = async (updates: { name?: string; bio?: string; profileImageUrl?: string }) => {
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

  const refreshUser = () => {
    if (dbUser?._id) {
      setDbUser(prev => prev ? { ...prev } : null)
    }
  }

  return {
    user: dbUser,
    cdpUser: currentUser,
    walletAddress: evmAddress,
    isLoading,
    error,
    isAuthenticated: !!(currentUser && evmAddress && dbUser),
    needsOnboarding: !!(dbUser && !dbUser.isOnboardingComplete),
    updateUser,
    refreshUser,
    setUser: setDbUser,
    setAuthenticatedEmail, // Expose method to set email from auth flow
  }
}