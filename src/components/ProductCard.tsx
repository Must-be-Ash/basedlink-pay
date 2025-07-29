import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatAddress } from "@/lib/utils"
import { ExternalLink, Copy, Edit, Power, PowerOff, Check } from "lucide-react"
import Link from "next/link"
// import { TextShimmer } from "@/components/ui/text-shimmer"
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
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    navigator.clipboard.writeText(productUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  const handleOpenLink = () => {
    const productUrl = `${window.location.origin}/pay/${product.slug}`
    window.open(productUrl, '_blank')
  }

  const isActive = product.isActive !== undefined ? product.isActive : product.status === 'active'

  return (
    <Card 
      className={`${className} transition-all duration-300 hover:shadow-xl border-0 overflow-hidden group`}
      style={{ 
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px'
      }}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {/* Product Name with Shimmer Effect */}
            {showOwnerActions && product._id ? (
              <Link 
                href={`/products/${product._id}`}
                className="block group/link"
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
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#6b7280' }}>
                {product.description}
              </p>
            )}
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant="outline"
            className="ml-3 px-3 py-1 text-xs font-medium rounded-full"
            style={{ 
              backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
              borderColor: isActive ? '#16a34a' : '#d1d5db',
              color: isActive ? '#16a34a' : '#6b7280'
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Price Section - Matching Product Page Style */}
        <div 
          className="flex items-center justify-between py-4 px-4 rounded-xl mb-4"
          style={{ backgroundColor: '#f9fafb' }}
        >
          <div>
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>USD</span>
            <div className="text-2xl font-bold" style={{ color: '#1f2937' }}>
              {formatCurrency(product.priceUSD)}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="px-3 py-1 text-sm font-medium"
            style={{ 
              backgroundColor: '#f3f4f6', 
              borderColor: '#d1d5db',
              color: '#374151'
            }}
          >
            {product.priceUSDC} USDC
          </Badge>
        </div>

        {/* Product Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6b7280' }}>Created:</span>
            <span className="font-medium" style={{ color: '#1f2937' }}>
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {product.recipientAddress && (
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6b7280' }}>Recipient:</span>
              <span className="font-mono text-xs" style={{ color: '#1f2937' }}>
                {formatAddress(product.recipientAddress)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6b7280' }}>Link:</span>
            <span className="font-mono text-xs truncate max-w-[120px]" style={{ color: '#1f2937' }}>
              /pay/{product.slug}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Actions Row */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: copied ? '#dcfce7' : '#f8f9fa',
                borderColor: copied ? '#16a34a' : '#e5e7eb',
                color: copied ? '#16a34a' : '#374151'
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenLink}
              className="px-4 h-10 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e5e7eb',
                color: '#374151'
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Owner Actions Row */}
          {showOwnerActions && (
            <div className="flex gap-3">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {onToggleStatus && (
                <Button
                  variant={isActive ? 'outline' : 'default'}
                  size="sm"
                  onClick={onToggleStatus}
                  className="flex-1 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={isActive ? { 
                    backgroundColor: '#fee2e2',
                    borderColor: '#fca5a5',
                    color: '#dc2626'
                  } : {
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  }}
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