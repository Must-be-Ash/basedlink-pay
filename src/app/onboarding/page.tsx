"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserSession } from "@/hooks/useUserSession"
import { OnboardingForm } from "@/components/OnboardingForm"
import { CDPProvider } from "@/components/CDPProvider"
import { Container } from "@/components/Container"
import { Loading } from "@/components/Loading"
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
      
      if (!needsOnboarding) {
        // Already completed onboarding, redirect to dashboard
        console.log('User onboarding complete, redirecting to dashboard')
        router.push('/dashboard')
        return
      }
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router])

  const handleOnboardingComplete = (updatedUser: User) => {
    console.log('Onboarding completed for user:', updatedUser.email)
    setUser(updatedUser)
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <CDPProvider>
        <div className="min-h-screen bg-background">
          <Container className="py-8">
            <Loading size="lg" text="Loading..." />
          </Container>
        </div>
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
      <OnboardingForm 
        user={user}
        onComplete={handleOnboardingComplete}
      />
    </CDPProvider>
  )
} 