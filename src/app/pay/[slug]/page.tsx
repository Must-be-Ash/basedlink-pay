"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Container } from "@/components/Container"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentButton } from "@/components/PaymentButton"
import { Loading } from "@/components/Loading"
import { formatCurrency } from "@/lib/utils"
import { CDPProvider } from "@/components/CDPProvider"
import { WalletAuth } from "@/components/WalletAuth"
import { useUserSession } from "@/hooks/useUserSession"
import { ShoppingBag, User, CheckCircle, AlertCircle, CreditCard, Wallet } from "lucide-react"
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
        <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
          <Container className="py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-8 h-8" style={{ color: '#dc2626' }} />
              </div>
              <h1 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Payment Link Not Found</h1>
              <p className="mb-6" style={{ color: '#6b7280' }}>
                {error || "This payment link is invalid or has been disabled."}
              </p>
              <Link href="/" className="hover:underline" style={{ color: '#3b82f6' }}>
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
        <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
          <Container className="py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#dcfce7' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#16a34a' }} />
              </div>
              <h1 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Payment Successful!</h1>
              <p className="mb-6" style={{ color: '#6b7280' }}>
                Thank you for your payment. Your transaction has been processed successfully.
              </p>
              <div className="text-left p-4 rounded-lg mb-6" style={{ backgroundColor: '#f3f4f6' }}>
                <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Purchased:</p>
                <p className="font-medium" style={{ color: '#1f2937' }}>{product.name}</p>
                <p className="text-sm mt-2 mb-1" style={{ color: '#6b7280' }}>Amount:</p>
                <p className="font-medium" style={{ color: '#1f2937' }}>{formatCurrency(product.priceUSD)}</p>
              </div>
              <Link href="/" className="hover:underline" style={{ color: '#3b82f6' }}>
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
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Container className="py-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#1f2937' }}>Complete Your Payment</h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Secure crypto payment powered by Coinbase
              </p>
            </div>

            {/* Combined Product & Payment Section */}
            <Card className="border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <CardContent className="p-8">
                {/* Product Details */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <ShoppingBag className="w-5 h-5" style={{ color: '#6b7280' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Product Details</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-2xl mb-3" style={{ color: '#1f2937' }}>{product.name}</h3>
                      {product.description && (
                        <p className="mb-4 leading-relaxed" style={{ color: '#6b7280' }}>{product.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-4 px-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                      <span className="text-3xl font-bold" style={{ color: '#1f2937' }}>
                        {formatCurrency(product.priceUSD)}
                      </span>
                      <Badge variant="outline" className="px-3 py-1" style={{ 
                        backgroundColor: '#f3f4f6', 
                        borderColor: '#d1d5db',
                        color: '#374151',
                        fontSize: '14px'
                      }}>
                        {product.priceUSDC} USDC
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-sm" style={{ color: '#6b7280' }}>
                      <User className="w-4 h-4" />
                      <span>Sold by {product.seller?.name || product.seller?.username || 'Seller'}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t mb-8" style={{ borderColor: '#e5e7eb' }}></div>

                {/* Payment Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-6">
                    <CreditCard className="w-5 h-5" style={{ color: '#6b7280' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Payment</h2>
                  </div>

                  {!isAuthenticated ? (
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <Wallet className="mx-auto h-12 w-12" style={{ color: '#9ca3af' }} />
                        <div>
                          <h3 className="font-semibold text-lg mb-2" style={{ color: '#1f2937' }}>Connect Your Wallet</h3>
                          <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                            Please connect your wallet to make a payment
                          </p>
                        </div>
                      </div>
                      <WalletAuth />
                    </div>
                  ) : (
                    <PaymentButton
                      product={product}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="mt-8 text-center">
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
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