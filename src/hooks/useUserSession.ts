"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [needsEmailInput, setNeedsEmailInput] = useState(false)

  // Store the email from authentication
  const setAuthenticatedEmail = useCallback((email: string) => {
    setAuthEmail(email)
    setNeedsEmailInput(false) // Reset the flag when email is provided
    // Also store in localStorage for persistence across page reloads
    localStorage.setItem('cdp_auth_email', email)
  }, [])

  // Load stored email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('cdp_auth_email')
    if (storedEmail && !authEmail) {
      console.log('Loading stored email:', storedEmail) // Debug log
      setAuthEmail(storedEmail)
    }
  }, [authEmail])

  // Store CDP user email when it becomes available
  useEffect(() => {
    const cdpEmail = (currentUser as CDPUser)?.email
    if (cdpEmail && !authEmail) {
      console.log('Storing CDP user email:', cdpEmail) // Debug log
      setAuthenticatedEmail(cdpEmail)
    }
  }, [currentUser, authEmail, setAuthenticatedEmail])

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

    // Don't proceed if we don't have any email source
    const hasEmailSource = authEmail || (currentUser as CDPUser)?.email
    if (!hasEmailSource) {
      console.log('Waiting for email to be available...') // Debug log
      setIsLoading(false)
      return
    }

    const syncUserToDatabase = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use stored email or CDP user email
        const cdpUser = currentUser as CDPUser
        const userEmail = authEmail || cdpUser?.email
        
        if (!userEmail) {
          console.log('No email available, trying to find user by wallet address...') // Debug log
          
          // Try to find existing user by wallet address
          try {
            const walletResponse = await fetch(`/api/users/by-wallet?address=${encodeURIComponent(evmAddress)}`)
            if (walletResponse.ok) {
              const { data: existingUser } = await walletResponse.json()
              console.log('Found existing user by wallet address:', existingUser.email)
              setDbUser(existingUser)
              // Store the email for future use
              setAuthenticatedEmail(existingUser.email)
              setIsLoading(false)
              return
            }
          } catch {
            console.log('No existing user found by wallet address')
          }
          
          console.log('No email available and no existing user found, user data:', { 
            hasAuthEmail: !!authEmail, 
            hasCdpEmail: !!cdpUser?.email,
            cdpUserKeys: cdpUser ? Object.keys(cdpUser) : 'no CDP user'
          }) // Debug log
          
          // Mark that we need email input from user
          setNeedsEmailInput(true)
          setIsLoading(false)
          return
        }

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
  }, [isInitialized, currentUser, evmAddress, authEmail, setAuthenticatedEmail])

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
    // Consider authenticated if we have CDP user and wallet, even if dbUser is still syncing
    isAuthenticated: !!(currentUser && evmAddress),
    needsOnboarding: !!(dbUser && !dbUser.isOnboardingComplete),
    needsEmailInput, // Flag to indicate when we need user to provide email
    updateUser,
    refreshUser,
    setUser: setDbUser,
    setAuthenticatedEmail, // Expose method to set email from auth flow
  }
}