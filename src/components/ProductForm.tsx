"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, Coins } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/types/product"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  priceUSD: z.number().min(0.01, "Price must be at least $0.01").max(10000, "Price too high"),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  className?: string
  defaultRecipientAddress?: string
}

export function ProductForm({ 
  product, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  className,
  defaultRecipientAddress
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      priceUSD: product?.priceUSD || 1,
      recipientAddress: product?.recipientAddress || defaultRecipientAddress || "",
    },
    mode: "onChange"
  })

  const watchedPrice = watch("priceUSD")

  // Calculate USDC equivalent (1:1 for now, could add real-time conversion)
  const usdcAmount = watchedPrice || 0

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Failed to save product")
    }
  }

  return (
    <Card 
      className={`${className} border-0`}
      style={{ 
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px'
      }}
    >
      <CardContent className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f8f8' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#ff5941' }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: '#1f2937' }}>
              {product ? "Edit Product" : "Product Details"}
            </h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Product Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-semibold" style={{ color: '#374151' }}>
              Product Name *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="My awesome product"
              disabled={isLoading}
              className="h-12 rounded-xl border-0 text-base"
              style={{ 
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />
            {errors.name && (
              <p className="text-sm" style={{ color: '#dc2626' }}>{errors.name.message}</p>
            )}
            <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
              Your payment link will be automatically generated from this name
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold" style={{ color: '#374151' }}>
              Description *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description of your product or service"
              disabled={isLoading}
              rows={4}
              className="rounded-xl border-0 text-base resize-none"
              style={{ 
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />
            {errors.description && (
              <p className="text-sm" style={{ color: '#dc2626' }}>{errors.description.message}</p>
            )}
          </div>

          {/* Price Section */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold" style={{ color: '#374151' }}>
              Pricing *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="priceUSD" className="text-xs font-medium" style={{ color: '#6b7280' }}>
                  Price (USD)
                </Label>
                <Input
                  id="priceUSD"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  {...register("priceUSD", { 
                    valueAsNumber: true,
                    setValueAs: (value) => parseFloat(value) || 0
                  })}
                  placeholder="1.00"
                  disabled={isLoading}
                  className="h-12 rounded-xl border-0 text-base"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    color: '#1f2937'
                  }}
                />
                {errors.priceUSD && (
                  <p className="text-sm" style={{ color: '#dc2626' }}>{errors.priceUSD.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-medium" style={{ color: '#6b7280' }}>
                  USDC Equivalent
                </Label>
                <div 
                  className="flex items-center justify-between h-12 px-4 rounded-xl"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 mr-2" style={{ color: '#6b7280' }} />
                    <span className="text-base font-medium" style={{ color: '#1f2937' }}>
                      {usdcAmount.toFixed(2)} USDC
                    </span>
                  </div>
                  <Badge 
                    variant="outline"
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: '#C4C4C4',
                      color: '#696969'
                    }}
                  >
                    1:1
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-3">
            <Label htmlFor="recipientAddress" className="text-sm font-semibold" style={{ color: '#374151' }}>
              Recipient Wallet Address *
            </Label>
            <Input
              id="recipientAddress"
              {...register("recipientAddress")}
              placeholder="Defaults to your connected wallet (editable)"
              disabled={isLoading}
              className="h-12 rounded-xl border-0 text-base font-mono text-sm"
              style={{ 
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />
            {errors.recipientAddress && (
              <p className="text-sm" style={{ color: '#dc2626' }}>{errors.recipientAddress.message}</p>
            )}
            <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
              Edit this field to send payments to a different wallet address
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="h-12 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  color: '#374151'
                }}
              >
                Cancel
              </Button>
            )}
            
            <Button3D
              type="submit"
              disabled={isLoading || !isValid}
              className="text-white text-base px-8 py-3 h-12 rounded-xl font-medium transition-all duration-200"
              style={{ 
                background: isLoading || !isValid 
                  ? '#9ca3af' 
                  : 'linear-gradient(to bottom, #ff6d41, #ff5420)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? "Update Product" : "Create Product"
              )}
            </Button3D>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}