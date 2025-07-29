"use client"

import React, { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/ProductCard"
import { EmptyState } from "@/components/EmptyState"
import { PageLoading } from "@/components/Loading"
// import { TextShimmer } from "@/components/ui/text-shimmer"
import { useUserSession } from "@/hooks/useUserSession"
import { formatCurrency } from "@/lib/utils"
import { 
  Plus, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Eye,
  ExternalLink,
  Zap,
  Globe
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/product"

interface Analytics {
  totalEarnings: number
  totalSales: number
  totalProducts: number
  activeProducts: number
  averageOrderValue: number
  recentPayments: { amountUSD: number; createdAt: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading: userLoading, needsOnboarding } = useUserSession()
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = React.useCallback(async () => {
    if (!user?._id) return

    try {
      setIsLoading(true)
      
      // Fetch products and analytics in parallel
      const [productsRes, analyticsRes] = await Promise.all([
        fetch(`/api/products?sellerId=${user._id}`),
        fetch(`/api/analytics/seller/${user._id}`)
      ])

      if (productsRes.ok) {
        const { data: productsData } = await productsRes.json()
        setProducts(productsData || [])
      }

      if (analyticsRes.ok) {
        const { data: analyticsData } = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    // Get authentication credentials
    const currentEmail = user?.email || localStorage.getItem('cdp_auth_email')
    const walletAddress = user?.walletAddress
    
    if (!currentEmail || !walletAddress) {
      console.error('Authentication required')
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': currentEmail,
          'x-wallet-address': walletAddress,
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        // Update the local state immediately for better UX
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id?.toString() === productId 
              ? { ...product, isActive: !currentStatus }
              : product
          )
        )
        
        // Also refresh analytics to get updated counts
        if (user?._id) {
          const analyticsRes = await fetch(`/api/analytics/seller/${user._id}`, {
            headers: {
              'x-user-email': currentEmail,
              'x-wallet-address': walletAddress,
            }
          })
          if (analyticsRes.ok) {
            const { data: analyticsData } = await analyticsRes.json()
            setAnalytics(analyticsData)
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error)
    }
  }

  // Redirect to onboarding if needed
  useEffect(() => {
    if (!userLoading && isAuthenticated && needsOnboarding) {
      router.push('/onboarding')
      return
    }
  }, [userLoading, isAuthenticated, needsOnboarding, router])

  useEffect(() => {
    if (isAuthenticated && user?._id && !needsOnboarding) {
      fetchData()
    }
  }, [isAuthenticated, user, fetchData, needsOnboarding])

  if (userLoading || isLoading) {
    return (
      <PageLoading text="Loading dashboard..." />
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
        <Header />
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f8f8f8' }}>
              <Zap className="w-8 h-8" style={{ color: '#ff5941' }} />
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              Connect Your Wallet
            </h1>
            <p className="mb-6 leading-relaxed" style={{ color: '#6b7280' }}>
              You need to connect your wallet to access the dashboard.
            </p>
            <Link href="/onboarding">
              <Button3D
                size="lg"
                className="text-white text-base px-8 py-3 h-auto rounded-xl font-medium"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
              >
                Connect Wallet
              </Button3D>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  if (needsOnboarding) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
      <Header />
      
      <Container className="py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
                              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  Welcome back, {user?.name || 'User'}
                </h1>
              <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
                Here&apos;s what&apos;s happening with your crypto payments
              </p>
            </div>
            <Link href="/products/new">
              <Button3D
                size="lg"
                className="text-white text-base px-6 py-3 h-auto rounded-xl font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </Button3D>
            </Link>
          </div>
        </div>

        <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card 
                className="border-0 transition-all duration-300 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#DBDBDB',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                      <DollarSign className="w-6 h-6" style={{ color: '#ff5941' }} />
                    </div>
                    <Badge 
                      variant="outline"
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: '#C4C4C4',
                        color: '#696969'
                      }}
                    >
                      {analytics?.totalSales || 0} sales
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                    {formatCurrency(analytics?.totalEarnings || 0)}
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    Total Earnings
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 transition-all duration-300 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#DBDBDB',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                      <ShoppingBag className="w-6 h-6" style={{ color: '#ff5941' }} />
                    </div>
                    <Badge 
                      variant="outline"
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                       backgroundColor: '#C4C4C4',
                       color: '#696969'
                      }}
                    >
                      {analytics?.activeProducts || 0} active
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                    {analytics?.totalProducts || 0}
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    Total Products
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 transition-all duration-300 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#DBDBDB',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                      <TrendingUp className="w-6 h-6" style={{ color: '#ff5941' }} />
                    </div>
                    <Badge 
                      variant="outline"
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: '#C4C4C4',
                        color: '#696969'
                      }}
                    >
                      Per transaction
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                    {formatCurrency(analytics?.averageOrderValue || 0)}
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    Average Order Value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
                  Your Products
                </h2>
                <div className="flex gap-3">
                  <Link href="/products">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: '#f8f9fa',
                        borderColor: '#e5e7eb',
                        color: '#374151'
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                  <Link href="/products/new">
                    <Button3D
                      size="default"
                      className="text-white text-sm px-4 py-2 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button3D>
                  </Link>
                </div>
              </div>

              {products.length === 0 ? (
                <Card 
                  className="border-0"
                  style={{ 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent className="py-16">
                    <EmptyState
                      icon={ShoppingBag}
                      title="No products yet"
                      description="Create your first product to start accepting crypto payments"
                      action={{
                        label: "Create Product",
                        onClick: () => router.push("/products/new")
                      }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 6).map((product) => {
                    const productId = product._id?.toString()
                    if (!productId) return null
                    
                    return (
                      <ProductCard
                        key={productId}
                        product={product}
                        showOwnerActions={true}
                        onEdit={() => router.push(`/products/${productId}/edit`)}
                        onToggleStatus={() => handleToggleStatus(
                          productId, 
                          product.isActive !== undefined ? product.isActive : product.status === 'active'
                        )}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              Recent Activity
                </h2>
                <Link href="/payments">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Payments
                  </Button>
                </Link>
              </div>

              {analytics?.recentPayments?.length === 0 ? (
                <Card 
                  className="border-0"
                  style={{ 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent className="py-16">
                    <EmptyState
                      title="No payments yet"
                      description="Your recent payment activity will appear here"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card 
                  className="border-0"
                  style={{ 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f8f8' }}>
                        <Globe className="w-5 h-5" style={{ color: '#ff5941' }} />
                      </div>
                      <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Recent Payments</h3>
                    </div>
                    <div className="space-y-4">
                      {analytics?.recentPayments?.slice(0, 5).map((payment, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                          style={{ backgroundColor: '#f9fafb' }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }} />
                            <div>
                              <p className="font-semibold" style={{ color: '#1f2937' }}>
                                {formatCurrency(payment.amountUSD)}
                              </p>
                              <p className="text-sm" style={{ color: '#6b7280' }}>
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: '#dcfce7',
                              borderColor: '#16a34a',
                              color: '#16a34a'
                            }}
                          >
                            Completed
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
      </Container>
    </div>
  )
}