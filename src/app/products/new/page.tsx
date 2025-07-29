"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { ProductForm } from "@/components/ProductForm"
import { useUserSession } from "@/hooks/useUserSession"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ProductFormData {
  name: string
  description?: string
  priceUSD: number
  recipientAddress?: string
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
              You need to connect your wallet to create products.
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
      
      <Container className="py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products">
            <Button 
              variant="outline" 
              className="mb-6 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e5e7eb',
                color: '#374151'
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Create New Product
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
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