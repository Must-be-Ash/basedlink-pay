import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatAddress } from "@/lib/utils"
import { ExternalLink, Copy, Edit, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  onEdit?: () => void
  onToggleStatus?: () => void
  showOwnerActions?: boolean
  className?: string
}

export function ProductCard({ 
  product, 
  onEdit, 
  onToggleStatus, 
  showOwnerActions = false,
  className 
}: ProductCardProps) {
  const handleCopyLink = () => {
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    navigator.clipboard.writeText(productUrl)
    toast.success("Payment link copied to clipboard", { duration: 1000 })
  }

  const handleOpenLink = () => {
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    window.open(productUrl, '_blank')
  }

  const isActive = product.isActive !== undefined ? product.isActive : product.status === 'active'

  return (
    <Card className={`${className} transition-all duration-200 hover:shadow-lg border-2 ${isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Clickable Product Name */}
            {showOwnerActions && product._id ? (
              <Link 
                href={`/products/${product._id}`}
                className="block group"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate">
                  {product.name}
                </h3>
              </Link>
            ) : (
              <h3 className="text-lg font-semibold text-foreground truncate">
                {product.name}
              </h3>
            )}
            
            {/* Product Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            )}
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant={isActive ? 'default' : 'secondary'}
            className={`ml-2 ${isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
          >
            {isActive ? 'active' : 'inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Section */}
        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
          <div>
            <div className="text-sm text-muted-foreground">$</div>
            <div className="text-2xl font-bold">{formatCurrency(product.priceUSD)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">USDC</div>
            <div className="text-lg font-semibold">{product.priceUSDC} USDC</div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
          
          {product.recipientAddress && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-mono text-xs">
                {formatAddress(product.recipientAddress)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Link:</span>
            <span className="font-mono text-xs truncate max-w-[120px]">
              /pay/{product.slug}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Primary Actions Row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenLink}
              className="px-3"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Owner Actions Row */}
          {showOwnerActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {onToggleStatus && (
                <Button
                  variant={isActive ? 'destructive' : 'default'}
                  size="sm"
                  onClick={onToggleStatus}
                  className="flex-1"
                >
                  {isActive ? (
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
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}