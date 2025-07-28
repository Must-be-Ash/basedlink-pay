"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { ProductForm } from "@/components/ProductForm"
import { Loading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import React from "react"
import type { Product } from "@/types/product"

interface ProductFormData {
  name: string
  description?: string
  priceUSD: number
  recipientAddress?: string
  slug: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { isAuthenticated, user, walletAddress } = useUserSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        toast.success("Product updated successfully!")
        router.push(`/products/${productId}`)
      } else {
        const { error } = await response.json()
        toast.error(error || "Failed to update product")
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error("Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/products/${productId}`)
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
          
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update your product details and settings
          </p>
        </div>

        {/* Form */}
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          defaultRecipientAddress={walletAddress || undefined}
        />
      </Container>
    </div>
  )
}