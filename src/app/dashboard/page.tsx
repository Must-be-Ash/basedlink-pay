"use client"

import React, { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/ProductCard"
import { EmptyState } from "@/components/EmptyState"
import { Loading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { formatCurrency } from "@/lib/utils"
import { 
  Plus, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Eye,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
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
  const { isAuthenticated, user, isLoading: userLoading } = useUserSession()
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

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchData()
    }
  }, [isAuthenticated, user, fetchData])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <Loading size="lg" text="Loading dashboard..." />
        </Container>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to access the dashboard.
            </p>
            <Link href="/test-wallet">
              <Button>Connect Wallet</Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Container className="py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening with your crypto payments
              </p>
            </div>
            <Link href="/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <Loading size="lg" text="Loading analytics..." />
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analytics?.totalEarnings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {analytics?.totalSales || 0} sales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.activeProducts || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analytics?.averageOrderValue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per transaction
                  </p>
                </CardContent>
              </Card>

             
            </div>

            {/* Products Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Products</h2>
                <div className="flex gap-2">
                  <Link href="/products">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                  <Link href="/products/new">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              </div>

              {products.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="No products yet"
                  description="Create your first product to start accepting crypto payments"
                  action={{
                    label: "Create Product",
                    onClick: () => window.location.href = "/products/new"
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product._id?.toString()}
                      product={product}
                      showOwnerActions={true}
                      onEdit={() => window.location.href = `/products/${product._id}/edit`}
                      onToggleStatus={() => {
                        // TODO: Implement toggle status
                        console.log('Toggle status for:', product._id)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <Link href="/payments">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Payments
                  </Button>
                </Link>
              </div>

              {analytics?.recentPayments?.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <EmptyState
                      title="No payments yet"
                      description="Your recent payment activity will appear here"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.recentPayments?.slice(0, 5).map((payment, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amountUSD)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="success">Completed</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  )
}