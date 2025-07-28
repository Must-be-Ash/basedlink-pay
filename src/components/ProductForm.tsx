"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { generateSlug } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/types/product"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  priceUSD: z.number().min(0.01, "Price must be at least $0.01").max(10000, "Price too high"),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
  slug: z.string().min(1, "URL slug is required").max(50, "Slug too long"),
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
  const [customSlug, setCustomSlug] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      priceUSD: product?.priceUSD || 1,
      recipientAddress: product?.recipientAddress || defaultRecipientAddress || "",
      slug: product?.slug || "",
    },
    mode: "onChange"
  })

  const watchedName = watch("name")
  const watchedSlug = watch("slug")
  const watchedPrice = watch("priceUSD")

  // Auto-generate slug from name unless user is customizing it
  useEffect(() => {
    if (!customSlug && watchedName) {
      const generatedSlug = generateSlug(watchedName)
      setValue("slug", generatedSlug, { shouldValidate: true })
    }
  }, [watchedName, customSlug, setValue])

  // Calculate USDC equivalent (1:1 for now, could add real-time conversion)
  const usdcAmount = watchedPrice || 0

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSlug(true)
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setValue("slug", value, { shouldValidate: true })
  }

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Failed to save product")
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {product ? "Edit Product" : "Create New Product"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="My awesome product"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description of your product or service"
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceUSD">Price (USD) *</Label>
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
              />
              {errors.priceUSD && (
                <p className="text-sm text-destructive">{errors.priceUSD.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>USDC Equivalent</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  {usdcAmount.toFixed(2)} USDC
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Wallet Address</Label>
            <Input
              id="recipientAddress"
              {...register("recipientAddress")}
              placeholder="Defaults to your connected wallet (editable)"
              disabled={isLoading}
            />
            {errors.recipientAddress && (
              <p className="text-sm text-destructive">{errors.recipientAddress.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Edit this field to send payments to a different wallet address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Payment Link URL *</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                basedlink.xyz/pay/
              </span>
              <Input
                id="slug"
                value={watchedSlug}
                onChange={handleSlugChange}
                placeholder="my-product"
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be your unique payment link
            </p>
          </div>

          {watchedSlug && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">Preview:</Label>
              <p className="font-mono text-sm">
                basedlink.xyz/pay/{watchedSlug}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? "Update Product" : "Create Product"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}