"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserSession } from "@/hooks/useUserSession"
import { OnboardingForm } from "@/components/OnboardingForm"
import { CDPProvider } from "@/components/CDPProvider"
import { PageLoading } from "@/components/Loading"
import { Container } from "@/components/Container"
import type { User } from "@/types/user"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, needsOnboarding, setUser } = useUserSession()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to auth
        console.log('User not authenticated, redirecting to auth')
        router.push('/auth')
        return
      }
      
      // Wait for user data to be loaded before checking onboarding status
      if (!user) {
        console.log('Waiting for user data to load...')
        return
      }
      
      if (!needsOnboarding) {
        // Already completed onboarding, redirect to dashboard
        console.log('User onboarding complete, redirecting to dashboard')
        router.push('/dashboard')
        return
      }
    }
  }, [isLoading, isAuthenticated, needsOnboarding, user, router])

  const handleOnboardingComplete = (updatedUser: User) => {
    console.log('Onboarding completed successfully')
    setUser(updatedUser)
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <CDPProvider>
        <PageLoading text="Loading..." />
      </CDPProvider>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect via useEffect
  }

  if (!needsOnboarding) {
    return null // Will redirect via useEffect
  }

  return (
    <CDPProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
        <Container>
          <OnboardingForm 
            user={user}
            onComplete={handleOnboardingComplete}
          />
        </Container>
      </div>
    </CDPProvider>
  )
} 