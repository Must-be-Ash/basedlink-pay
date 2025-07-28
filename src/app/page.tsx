"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/Container"
import { CDPProvider } from "@/components/CDPProvider"
import { useUserSession } from "@/hooks/useUserSession"
import { ArrowRight, Zap, Globe, Shield, DollarSign } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useUserSession()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }
  
  return (
    <CDPProvider>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              Powered by Coinbase Developer Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Accept Crypto Payments
              <span className="text-primary block">Like Stripe Link</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create products, generate shareable payment links, and accept crypto payments instantly. 
              No wallet downloads or complex setup required for your customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleGetStarted} size="lg" className="min-w-[200px]">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                View Demo
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Crypto Payments?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the benefits of crypto payments with the simplicity of traditional payment processors.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Instant Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive payments in seconds, not days. Base network ensures fast confirmation times.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Low Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pay ~$0.01 per transaction instead of 2.9% + 30¢ with traditional processors.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Accept payments from anywhere in the world without geographic restrictions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">No Wallet Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Customers pay with just their email - wallets are created automatically and securely.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start accepting crypto payments
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Product</h3>
              <p className="text-muted-foreground">
                Add your product details, description, and set a price in USD.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Link</h3>
              <p className="text-muted-foreground">
                Get a shareable payment link and distribute it to your customers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
              <p className="text-muted-foreground">
                Customers pay with their email and you receive USDC instantly.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators and businesses accepting crypto payments with ease.
            </p>
            <Button onClick={handleGetStarted} size="lg">
              Create Your First Product
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
        </Container>
      </section>
      </div>
    </CDPProvider>
  )
}