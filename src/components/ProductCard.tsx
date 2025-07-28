import React from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatAddress } from "@/lib/utils"
import { ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"
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
    toast.success("Payment link copied to clipboard")
  }

  const handleOpenLink = () => {
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    window.open(productUrl, '_blank')
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
              <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                {product.status}
              </Badge>
            </div>
            
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatCurrency(product.priceUSD)}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.priceUSDC} USDC
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
          
          {product.recipientAddress && (
            <div className="flex justify-between">
              <span>Recipient:</span>
              <span className="font-mono">
                {formatAddress(product.recipientAddress)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Link:</span>
            <span className="font-mono">
              /pay/{product.slug}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
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
        >
          <ExternalLink className="w-4 h-4" />
        </Button>

        {showOwnerActions && (
          <>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            
            {onToggleStatus && (
              <Button
                variant={product.status === 'active' ? 'destructive' : 'default'}
                size="sm"
                onClick={onToggleStatus}
              >
                {product.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}