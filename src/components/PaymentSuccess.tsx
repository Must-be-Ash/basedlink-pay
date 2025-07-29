"use client"

import React from "react"
import { Container } from "@/components/Container"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button3D } from "@/components/ui/button-3d"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { CheckCircle, ExternalLink, Copy, User } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import type { ProductWithSeller } from "@/types/product"

interface PaymentSuccessProps {
  product: ProductWithSeller
  transactionHash: string
  paymentId?: string
}

export function PaymentSuccess({ product, transactionHash, paymentId }: PaymentSuccessProps) {
  const handleCopyTxHash = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash)
      toast.success("Transaction hash copied to clipboard")
    } catch {
      toast.error("Failed to copy transaction hash")
    }
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#333333' }}>
      <Container className="py-2 sm:py-4 md:py-8 px-4 w-full">
        <div className="max-w-md mx-auto w-full">
          {/* Success Card */}
          <Card className="border" style={{ backgroundColor: '#f8f9fa', borderColor: '#e5e7eb' }}>
            <CardContent className="p-3 sm:p-4 md:p-6">
              
              {/* Success Icon & Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" 
                     style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: '#16a34a' }} />
                </div>
                
                <TextShimmer
                  as="h1"
                  className="font-bold text-lg sm:text-xl md:text-2xl mb-2 [--base-color:#1C1C1C] [--base-gradient-color:#696969]"
                  duration={2}
                  spread={4}
                >
                  Payment Successful!
                </TextShimmer>
                
                <p className="text-sm sm:text-base leading-relaxed px-2" style={{ color: '#6b7280' }}>
                  Thank you for your payment. Your transaction has been processed successfully.
                </p>
              </div>

              {/* Purchase Details */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <h3 className="font-bold text-lg sm:text-xl mb-1" style={{ color: '#1f2937' }}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Amount Display */}
                <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 rounded-lg" 
                     style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: '#1f2937' }}>
                    {formatCurrency(product.priceUSD)}
                  </span>
                  <Badge variant="outline" className="px-2 sm:px-3 py-1" style={{ 
                    backgroundColor: '#dcfce7', 
                    borderColor: '#bbf7d0',
                    color: '#16a34a',
                    fontSize: '11px'
                  }}>
                    {product.priceUSDC} USDC
                  </Badge>
                </div>

                {/* Seller Info */}
                <div className="flex items-center space-x-3 py-2 sm:py-3 px-3 sm:px-4 rounded-lg" 
                     style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  {product.seller?.profileImageUrl ? (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                      <Image
                        src={product.seller.profileImageUrl}
                        alt={product.seller.name || product.seller.username || 'Seller'}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#64748b' }}>Sold by</p>
                    <p className="text-sm font-semibold" style={{ color: '#334155' }}>
                      {product.seller?.name || product.seller?.username || 'Seller'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="border-t mb-4 sm:mb-6" style={{ borderColor: '#e5e7eb' }}></div>
              
              <div className="space-y-3 mb-4 sm:mb-6">
                <h4 className="font-semibold text-sm" style={{ color: '#374151' }}>
                  Transaction Details
                </h4>
                
                {/* Transaction Hash */}
                <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                        Transaction Hash
                      </p>
                      <p className="font-mono text-xs sm:text-sm truncate" style={{ color: '#1f2937' }}>
                        {formatTxHash(transactionHash)}
                      </p>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 ml-2">
                      <button
                        onClick={handleCopyTxHash}
                        className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: '#f3f4f6' }}
                        title="Copy transaction hash"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#6b7280' }} />
                      </button>
                      <a
                        href={`https://basescan.org/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: '#f3f4f6' }}
                        title="View on BaseScan"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#6b7280' }} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Payment ID */}
                {paymentId && (
                  <div className="p-2 sm:p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                      Payment ID
                    </p>
                    <p className="font-mono text-xs sm:text-sm break-all" style={{ color: '#1f2937' }}>
                      {paymentId}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <Link href="/">
                  <Button3D
                    size="lg"
                    className="w-full text-white text-sm sm:text-base py-2.5 sm:py-3 h-auto rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                    }}
                  >
                    Return to Homepage
                  </Button3D>
                </Link>
                
                <Link href="/dashboard">
                  <button className="w-full py-2.5 sm:py-3 px-4 mt-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm"
                          style={{ 
                            backgroundColor: '#f8f9fa',
                            borderColor: '#e5e7eb',
                            color: '#374151',
                            border: '1px solid #e5e7eb'
                          }}>
                    View Dashboard
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-4 sm:mt-6 md:mt-8 text-center">
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
              🔒 Payments are processed securely by Coinbase
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
} 