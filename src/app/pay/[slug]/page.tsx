"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Container } from "@/components/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentButton } from "@/components/PaymentButton"
import { Loading } from "@/components/Loading"
import { formatCurrency } from "@/lib/utils"
import { CDPProvider } from "@/components/CDPProvider"
import { WalletAuth } from "@/components/WalletAuth"
import { useUserSession } from "@/hooks/useUserSession"
import { ShoppingBag, User, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { ProductWithSeller } from "@/types/product"

export default function PaymentPage() {
  const params = useParams()
  const slug = params.slug as string
  const { isAuthenticated } = useUserSession()
  const [product, setProduct] = useState<ProductWithSeller | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const fetchProduct = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/public/${slug}`)
      
      if (response.ok) {
        const { data } = await response.json()
        setProduct(data)
      } else {
        setError("Product not found or inactive")
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setError("Failed to load product")
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug, fetchProduct])

  const handlePaymentSuccess = (txHash: string) => {
    setPaymentSuccess(true)
    // Could also record the payment here via API
    console.log('Payment successful with hash:', txHash)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
  }

  if (isLoading) {
    return (
      <CDPProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loading size="lg" text="Loading payment page..." />
        </div>
      </CDPProvider>
    )
  }

  if (error || !product) {
    return (
      <CDPProvider>
        <div className="min-h-screen bg-background">
          <Container className="py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Payment Link Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error || "This payment link is invalid or has been disabled."}
              </p>
              <Link href="/" className="text-primary hover:underline">
                Return to Homepage
              </Link>
            </div>
          </Container>
        </div>
      </CDPProvider>
    )
  }

  if (paymentSuccess) {
    return (
      <CDPProvider>
        <div className="min-h-screen bg-background">
          <Container className="py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your payment. Your transaction has been processed successfully.
              </p>
              <div className="text-left bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-1">Purchased:</p>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground mt-2 mb-1">Amount:</p>
                <p className="font-medium">{formatCurrency(product.priceUSD)}</p>
              </div>
              <Link href="/" className="text-primary hover:underline">
                Return to Homepage
              </Link>
            </div>
          </Container>
        </div>
      </CDPProvider>
    )
  }

  return (
    <CDPProvider>
      <div className="min-h-screen bg-background">
        <Container className="py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
              <p className="text-muted-foreground">
                Secure crypto payment powered by Coinbase
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Product Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-muted-foreground mb-4">{product.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(product.priceUSD)}
                    </span>
                    <Badge variant="outline">
                      {product.priceUSDC} USDC
                    </Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Sold by {product.seller?.name || 'Seller'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your wallet to complete the payment
                      </p>
                      <WalletAuth />
                    </div>
                  ) : (
                    <PaymentButton
                      product={product}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Payments are processed securely on the Base network. 
                Your transaction will be confirmed within seconds.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </CDPProvider>
  )
}