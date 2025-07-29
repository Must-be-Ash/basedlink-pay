"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Container } from "@/components/Container"
import { Card, CardContent } from "@/components/ui/card"
import { CDPProvider } from "@/components/CDPProvider"
import { WalletAuth } from "@/components/WalletAuth"
import { useUserSession } from "@/hooks/useUserSession"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CDPUser } from "@/types/cdp"

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, needsOnboarding, user, isLoading, needsEmailInput, setAuthenticatedEmail } = useUserSession()
  const [emailInput, setEmailInput] = useState("")
  const [emailSubmitting, setEmailSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Wait for user data to be available before checking onboarding status
      if (!user) {
        console.log('Waiting for user data to load before redirecting...')
        return
      }
      
      if (needsOnboarding) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, needsOnboarding, user, isLoading, router])

  const handleAuthSuccess = (_user: CDPUser, _address: string, email: string) => {
    console.log('Authentication successful') // Debug log
    setAuthenticatedEmail(email)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return
    
    setEmailSubmitting(true)
    try {
      console.log('Setting email for pre-authenticated user')
      setAuthenticatedEmail(emailInput)
    } catch (error) {
      console.error('Failed to set email:', error)
    } finally {
      setEmailSubmitting(false)
    }
  }

  return (
    <CDPProvider>
      <style>{`
        .wallet-auth-container {
          --primary: #ff5941;
          --primary-rgb: 255, 89, 65;
          --primary-foreground: #ffffff;
        }
        .wallet-auth-container [class*="bg-primary/10"] {
          background-color: rgba(var(--primary-rgb), 0.1) !important;
        }
        .wallet-auth-container [class*="text-primary"]:not([class*="text-primary-foreground"]) {
          color: var(--primary) !important;
        }
        .wallet-auth-container [class*="bg-primary"]:not([class*="bg-primary/"]) {
          background: linear-gradient(to bottom, #ff6d41, #ff5420) !important;
        }
        .wallet-auth-container [class*="text-primary-foreground"] {
          color: var(--primary-foreground) !important;
        }
        .wallet-auth-container button[class*="bg-primary"]:hover {
          background: linear-gradient(to bottom, #ff6d41, #ff5420) !important;
          opacity: 0.9;
        }
        .wallet-auth-container input:focus {
          --tw-ring-color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F2F2' }}>
        <Container className="py-8 px-4 w-full">
          <div className="max-w-md mx-auto w-full">
            
            {needsEmailInput ? (
              <Card 
                className="border-0 transition-all duration-300 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px'
                }}
              >
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-3" style={{ color: '#1a1a1a' }}>
                        Complete Your Profile
                      </h1>
                      <p className="leading-relaxed" style={{ color: '#6b7280' }}>
                        Your wallet is connected! Please provide your email address to complete setup.
                      </p>
                    </div>
                    
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#374151' }}>
                          Email Address
                        </Label>
                        <Input 
                          id="email"
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={emailSubmitting}
                          className="h-12 rounded-xl border transition-all duration-200 mt-2"
                          style={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e5e7eb',
                            color: '#1f2937'
                          }}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl font-medium transition-all duration-200"
                        disabled={emailSubmitting || !emailInput.trim()}
                        style={{ 
                          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                          color: '#ffffff'
                        }}
                      >
                        {emailSubmitting ? "Setting up..." : "Continue"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card 
                className="border-0 transition-all duration-300 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px'
                }}
              >
                <CardContent className="p-8">
                  <div className="wallet-auth-container">
                    <WalletAuth onAuthSuccess={handleAuthSuccess} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </div>
    </CDPProvider>
  )
}