"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container } from "@/components/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CDPProvider } from "@/components/CDPProvider"
import { WalletAuth } from "@/components/WalletAuth"
import { useUserSession } from "@/hooks/useUserSession"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Zap, 
  Lock, 
  Smartphone,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import type { CDPUser } from "@/types/cdp"

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, needsOnboarding, setAuthenticatedEmail } = useUserSession()

  useEffect(() => {
    if (isAuthenticated) {
      if (needsOnboarding) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, needsOnboarding, router])

  const handleAuthSuccess = (user: CDPUser, address: string, email: string) => {
    console.log('Authentication successful with email:', email) // Debug log
    setAuthenticatedEmail(email)
  }

  return (
    <CDPProvider>
      <div className="min-h-screen bg-background">
        <Container className="py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get started with crypto payments in seconds. No wallet downloads or complex setup required.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Authentication Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Sign In with Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <WalletAuth onAuthSuccess={handleAuthSuccess} />
                </CardContent>
              </Card>

              {/* Features */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Why Choose Email Wallet?</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Instant Setup</h3>
                      <p className="text-sm text-muted-foreground">
                        No downloads, browser extensions, or seed phrases. 
                        Just sign in with your email and start accepting payments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Enterprise Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Your wallet is secured by Coinbase&apos;s institutional-grade 
                        infrastructure with multi-party computation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Self-Custody</h3>
                      <p className="text-sm text-muted-foreground">
                        You maintain full control of your funds. 
                        Coinbase cannot access or freeze your wallet.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                      <Smartphone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Cross-Device Access</h3>
                      <p className="text-sm text-muted-foreground">
                        Access your wallet from any device by signing in with 
                        your email. No need to transfer seed phrases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Enter your email address</li>
                    <li>Check your email for a verification code</li>
                    <li>Enter the code to create your wallet</li>
                    <li>Start accepting crypto payments immediately</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Trusted by thousands of creators and businesses
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">$50M+</div>
                  <div className="text-sm text-muted-foreground">Secured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center">
              <p className="text-xs text-muted-foreground">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                <br />
                Powered by Coinbase Developer Platform • Built on Base Network
              </p>
            </div>
          </div>
        </Container>
      </div>
    </CDPProvider>
  )
}