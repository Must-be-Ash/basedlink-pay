"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { PageLoading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { formatCurrency, formatAddress } from "@/lib/utils"
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  ExternalLink, 
  Calendar,
  User,
  // Link as LinkIcon,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import React from "react"
import type { Product } from "@/types/product"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { isAuthenticated, user } = useUserSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const fetchProduct = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      
      if (response.ok) {
        const { data } = await response.json()
        setProduct(data)
      } else {
        toast.error("Product not found")
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error("Failed to load product")
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  const handleCopyLink = () => {
    if (!product) return
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    navigator.clipboard.writeText(productUrl)
    setIsCopied(true)
    toast.success("Payment link copied to clipboard", { duration: 1000 })
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const handleOpenLink = () => {
    if (!product) return
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    window.open(productUrl, '_blank')
  }

  const handleToggleStatus = async () => {
    if (!product) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive })
      })

      if (response.ok) {
        setProduct({ ...product, isActive: !product.isActive })
        toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`)
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      toast.error("Failed to update product status")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Header />
        <Container className="py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="p-8 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <h1 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Please Connect Your Wallet</h1>
              <p className="mb-6 leading-relaxed" style={{ color: '#6b7280' }}>
                You need to connect your wallet to view products.
              </p>
              <Link href="/onboarding">
                <Button 
                  className="px-6 py-3"
                  style={{ 
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  Connect Wallet
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (isLoading) {
    return (
      <PageLoading text="Loading product..." />
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Header />
        <Container className="py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="p-8 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <h1 className="text-2xl font-bold mb-4" style={{ color: '#1f2937' }}>Product Not Found</h1>
              <p className="mb-6 leading-relaxed" style={{ color: '#6b7280' }}>
                The product you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link href="/products">
                <Button 
                  className="px-6 py-3"
                  style={{ 
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // Check if user owns this product
  const isOwner = user?._id?.toString() === product.sellerId?.toString()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafbfc' }}>
      <Header />
      
      <Container className="py-12 max-w-3xl">
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/products">
            <Button 
              variant="ghost" 
              className="px-0 text-sm font-medium hover:bg-transparent"
              style={{ color: '#64748b' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          {/* Product Header */}
          <div className="space-y-6">
            {/* Action Buttons - Top Right */}
            {isOwner && (
              <div className="flex justify-end gap-3">
                <Link href={`/products/${productId}/edit`}>
                  <Button 
                    variant="outline" 
                    className="px-6 py-2.5 text-sm font-medium border-2 hover:shadow-sm"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#475569'
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                </Link>
                <Button
                  variant={product.isActive ? "destructive" : "default"}
                  onClick={handleToggleStatus}
                  className="px-6 py-2.5 text-sm font-medium hover:shadow-sm"
                  style={{ 
                    backgroundColor: product.isActive ? '#dc2626' : '#0f172a',
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            )}

            {/* Product Content */}
            <div className="space-y-4 pl-4 pb-8">
              {/* Status */}
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: product.isActive ? '#22c55e' : '#94a3b8' }}
                />
                <span 
                  className="text-sm font-medium"
                  style={{ color: product.isActive ? '#22c55e' : '#64748b' }}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-semibold tracking-tight" style={{ color: '#0f172a' }}>
                {product.name}
              </h1>

              {/* Description */}
              {product.description && (
                <p className="text-lg leading-relaxed max-w-2xl" style={{ color: '#475569' }}>
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Payment Link Section */}
          <div>
            <div className="p-5 rounded-xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>
                    PUBLIC URL
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm" style={{ color: '#64748b' }}>basedlink.xyz</span>
                    <span className="font-mono text-sm font-medium ml-1" style={{ color: '#0f172a' }}>
                      /pay/{product.slug}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
                    className="px-4 py-2 text-sm font-medium border-2 hover:shadow-sm transition-all"
                    style={{ 
                      backgroundColor: isCopied ? '#22c55e' : '#ffffff',
                      borderColor: isCopied ? '#22c55e' : '#e2e8f0',
                      color: isCopied ? '#ffffff' : '#475569'
                    }}
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenLink}
                    className="px-4 py-2 text-sm font-medium border-2 hover:shadow-sm"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#475569'
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
            <div className="flex items-center gap-12">
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>USD Price</div>
                <div className="text-3xl font-semibold" style={{ color: '#0f172a' }}>
                  {formatCurrency(product.priceUSD)}
                </div>
              </div>
              <div className="w-px h-16" style={{ backgroundColor: '#e2e8f0' }}></div>
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>USDC Price</div>
                <div className="text-3xl font-semibold" style={{ color: '#059669' }}>
                  {product.priceUSDC} USDC
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="text-right">
                <div className="text-sm font-medium mb-1" style={{ color: '#64748b' }}>Network</div>
                <div className="flex items-center justify-end">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-sm font-medium" style={{ color: '#475569' }}>Base</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
              <div className="text-3xl font-semibold mb-1" style={{ color: '#0f172a' }}>0</div>
              <div className="text-sm font-medium" style={{ color: '#64748b' }}>Total Sales</div>
              <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>All time</div>
            </div>
            <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
              <div className="text-3xl font-semibold mb-1" style={{ color: '#0f172a' }}>$0.00</div>
              <div className="text-sm font-medium" style={{ color: '#64748b' }}>Revenue</div>
              <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>Total earned</div>
            </div>
            <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
              <div className="text-3xl font-semibold mb-1" style={{ color: '#0f172a' }}>0</div>
              <div className="text-sm font-medium" style={{ color: '#64748b' }}>Page Views</div>
              <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>Last 30 days</div>
            </div>
          </div>

          {/* Product Information */}
          <div className="p-6 rounded-xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Created Date</div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" style={{ color: '#94a3b8' }} />
                  <span className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              {product.recipientAddress && (
                <div>
                  <div className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Recipient Address</div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" style={{ color: '#94a3b8' }} />
                    <span className="font-mono text-sm font-medium" style={{ color: '#0f172a' }}>
                      {formatAddress(product.recipientAddress)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {isOwner && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid #f1f5f9' }}>
                <div className="text-sm font-medium mb-4" style={{ color: '#64748b' }}>Quick Actions</div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleOpenLink}
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: '#3b82f6' }}
                  >
                    Preview Payment Page
                  </button>
                  <Link 
                    href={`/payments?productId=${productId}`}
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: '#3b82f6' }}
                  >
                    View Payment History
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}