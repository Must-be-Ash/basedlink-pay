"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { formatCurrency, formatAddress } from "@/lib/utils"
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  ExternalLink, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  Link as LinkIcon
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
    toast.success("Payment link copied to clipboard")
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
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to view products.
            </p>
            <Link href="/test-wallet">
              <Button>Connect Wallet</Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <Loading size="lg" text="Loading product..." />
        </Container>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  // Check if user owns this product
  const isOwner = user?._id?.toString() === product.sellerId?.toString()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Container className="py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/products/${productId}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant={product.isActive ? "destructive" : "default"}
                  onClick={handleToggleStatus}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Price (USD)</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(product.priceUSD)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Price (USDC)</div>
                    <div className="text-2xl font-bold text-primary">
                      {product.priceUSDC} USDC
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Created</div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {product.recipientAddress && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Recipient</div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {formatAddress(product.recipientAddress)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">$0.00</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Payment Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Public URL</div>
                  <div className="font-mono text-sm break-all">
                    basedlink.xyz/pay/{product.slug}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopyLink} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={handleOpenLink}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Share this link with customers to accept payments
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/products/${productId}/edit`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Product
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleOpenLink}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Page
                  </Button>
                  
                  <Link href={`/payments?productId=${productId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      View Payments
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}