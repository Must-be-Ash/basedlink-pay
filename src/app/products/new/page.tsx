"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { ProductForm } from "@/components/ProductForm"
import { useUserSession } from "@/hooks/useUserSession"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ProductFormData {
  name: string
  description?: string
  priceUSD: number
  recipientAddress?: string
  slug: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { isAuthenticated, user, walletAddress } = useUserSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ProductFormData) => {
    if (!user?._id) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sellerId: user._id,
          recipientAddress: data.recipientAddress || undefined,
        }),
      })

      if (response.ok) {
        const { data: product } = await response.json()
        toast.success("Product created successfully!")
        router.push(`/products/${product._id}`)
      } else {
        const { error } = await response.json()
        toast.error(error || "Failed to create product")
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error("Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to create products.
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
      
      <Container className="py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <p className="text-muted-foreground">
            Set up a new product to start accepting crypto payments
          </p>
        </div>

        {/* Form */}
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          defaultRecipientAddress={walletAddress || undefined}
        />
      </Container>
    </div>
  )
}