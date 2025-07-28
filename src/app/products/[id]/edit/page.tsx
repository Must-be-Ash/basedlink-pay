"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { ProductForm } from "@/components/ProductForm"
import { Loading } from "@/components/Loading"
import { DeleteProductModal } from "@/components/DeleteProductModal"
import { useUserSession } from "@/hooks/useUserSession"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Power, PowerOff, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import React from "react"
import type { Product } from "@/types/product"

interface ProductFormData {
  name: string
  description?: string
  priceUSD: number
  recipientAddress?: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { isAuthenticated, user, walletAddress, isLoading: userLoading } = useUserSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchProduct = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      
      if (response.ok) {
        const { data } = await response.json()
        setProduct(data)
      } else {
        toast.error("Product not found")
        router.push('/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error("Failed to load product")
      router.push('/products')
    } finally {
      setIsLoading(false)
    }
  }, [productId, router])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  const handleSubmit = async (data: ProductFormData) => {
    if (!user?._id || !product) {
      toast.error("Unable to update product")
      return
    }

    // Check if user owns this product
    if (user._id.toString() !== product.sellerId?.toString()) {
      toast.error("You don't have permission to edit this product")
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recipientAddress: data.recipientAddress || undefined,
        }),
      })

      if (response.ok) {
        toast.success("Product updated successfully!", { duration: 1000 })
        router.push(`/products/${productId}`)
      } else {
        const { error } = await response.json()
        toast.error(error || "Failed to update product", { duration: 1000 })
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error("Failed to update product", { duration: 1000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!product) return

    try {
      setIsTogglingStatus(true)
      const newStatus = !product.isActive

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus
        }),
      })

      if (response.ok) {
        setProduct(prev => prev ? { ...prev, isActive: newStatus } : null)
        toast.success(
          newStatus ? "Product activated successfully!" : "Product deactivated successfully!",
          { duration: 1000 }
        )
      } else {
        const { error } = await response.json()
        toast.error(error || "Failed to update product status", { duration: 1000 })
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      toast.error("Failed to update product status", { duration: 1000 })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!product) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Product deleted successfully!", { duration: 1000 })
        setShowDeleteModal(false)
        router.push('/products')
      } else {
        const { error } = await response.json()
        toast.error(error || "Failed to delete product", { duration: 1000 })
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error("Failed to delete product", { duration: 1000 })
    }
  }

  const handleCancel = () => {
    router.push(`/products/${productId}`)
  }

  // Show loading if user session is still loading
  if (userLoading || isLoading) {
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
              You need to connect your wallet to edit products.
            </p>
            <Link href="/onboarding">
              <Button>Connect Wallet</Button>
            </Link>
          </div>
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
              The product you&apos;re trying to edit doesn&apos;t exist.
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

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have permission to edit this product.
            </p>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const isActive = product.isActive !== undefined ? product.isActive : product.status === 'active'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Container className="py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/products/${productId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Product
            </Button>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Edit Product</h1>
              <p className="text-muted-foreground">
                Update your product details and settings
              </p>
            </div>
            
            {/* Status Badge */}
            <Badge 
              variant={isActive ? 'default' : 'secondary'}
              className={`${isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={isActive ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className="flex-1"
            >
              {isTogglingStatus ? (
                "Updating..."
              ) : isActive ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </div>

        {/* Form */}
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          defaultRecipientAddress={walletAddress || undefined}
        />

        {/* Delete Modal */}
        <DeleteProductModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProduct}
          product={product}
        />
      </Container>
    </div>
  )
}