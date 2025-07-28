"use client"

import React, { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/ProductCard"
import { EmptyState } from "@/components/EmptyState"
import { Loading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { Plus, Search, ShoppingBag } from "lucide-react"
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

  // const handleDeleteProduct = async (productId: string) => {
  //   if (!confirm('Are you sure you want to delete this product?')) return

  //   try {
  //     const response = await fetch(`/api/products/${productId}`, {
  //       method: 'DELETE'
  //     })

  //     if (response.ok) {
  //       // Refresh products
  //       fetchProducts()
  //     }
  //   } catch (error) {
  //     console.error('Failed to delete product:', error)
  //   }
  // }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <Loading size="lg" text="Loading..." />
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
              You need to connect your wallet to manage products.
            </p>
            <Link href="/onboarding">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Manage your products and payment links
            </p>
          </div>
          <Link href="/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {products.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Products</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {products.filter(p => !p.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Inactive Products</div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <Loading size="lg" text="Loading products..." />
        ) : filteredProducts.length === 0 ? (
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