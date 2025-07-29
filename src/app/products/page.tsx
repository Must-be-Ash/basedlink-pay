"use client"

import React, { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/ProductCard"
import { EmptyState } from "@/components/EmptyState"
import { Loading, PageLoading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { Plus, Search, ShoppingBag, Zap, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/types/product"

export default function ProductsPage() {
  const { isAuthenticated, user, isLoading: userLoading } = useUserSession()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  const fetchProducts = React.useCallback(async () => {
    if (!user?._id) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/products?sellerId=${user._id}`)
      
      if (response.ok) {
        const { data } = await response.json()
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const filterProducts = React.useCallback(() => {
    let filtered = products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => 
        statusFilter === "active" ? product.isActive : !product.isActive
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, statusFilter])

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchProducts()
    }
  }, [isAuthenticated, user, fetchProducts])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, statusFilter, filterProducts])

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        // Refresh products
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error)
    }
  }

  if (userLoading) {
    return (
      <PageLoading text="Loading..." />
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
              You need to connect your wallet to manage products.
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
      <Header />
      
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
              Products
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
              Manage your products and payment links
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
                  Total
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                {products.length}
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
                  Live
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                {products.filter(p => p.isActive).length}
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Active Products
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
                  <Activity className="w-6 h-6" style={{ color: '#ff5941' }} />
                </div>
                <Badge 
                  variant="outline"
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: '#C4C4C4',
                    color: '#696969'
                  }}
                >
                  Paused
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                {products.filter(p => !p.isActive).length}
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Inactive Products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card 
          className="border-0 mb-8"
          style={{ 
            backgroundColor: '#DBDBDB',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px'
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-0 text-base"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "all" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "active" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "inactive" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" text="Loading products..." />
          </div>
        ) : filteredProducts.length === 0 ? (
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
                title={products.length === 0 ? "No products yet" : "No products found"}
                description={
                  products.length === 0 
                    ? "Create your first product to start accepting crypto payments"
                    : "Try adjusting your search or filter criteria"
                }
                action={
                  products.length === 0 
                    ? {
                        label: "Create Product",
                        onClick: () => window.location.href = "/products/new"
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id?.toString()}
                product={product}
                showOwnerActions={true}
                onEdit={() => window.location.href = `/products/${product._id}/edit`}
                onToggleStatus={() => handleToggleStatus(
                  product._id!.toString(), 
                  product.isActive
                )}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}