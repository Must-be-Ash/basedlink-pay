import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatAddress } from "@/lib/utils"
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink, 
  Copy,
  AlertCircle,
  User,
  Package
} from "lucide-react"
import { toast } from "sonner"
import type { Payment } from "@/types/payment"

interface PaymentStatusProps {
  payment: Payment
  showDetails?: boolean
  className?: string
}

export function PaymentStatus({ 
  payment, 
  showDetails = true, 
  className 
}: PaymentStatusProps) {
  const getStatusIcon = () => {
    switch (payment.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" style={{ color: '#16a34a' }} />
      case 'pending':
        return <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
      case 'failed':
        return <XCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
      default:
        return <AlertCircle className="w-5 h-5" style={{ color: '#6b7280' }} />
    }
  }

  const getStatusText = () => {
    switch (payment.status) {
      case 'completed':
        return 'Payment Completed'
      case 'pending':
        return 'Payment Pending'
      case 'failed':
        return 'Payment Failed'
      default:
        return 'Unknown Status'
    }
  }

  const handleCopyTxHash = () => {
    if (payment.transactionHash) {
      navigator.clipboard.writeText(payment.transactionHash)
      toast.success("Transaction hash copied to clipboard")
    }
  }

  const handleViewOnExplorer = () => {
    if (payment.transactionHash) {
      const explorerUrl = `https://basescan.org/tx/${payment.transactionHash}`
      window.open(explorerUrl, '_blank')
    }
  }

  return (
    <Card 
      className={`${className} border-0 transition-all duration-300 hover:shadow-xl`}
      style={{ 
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px'
      }}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: '#1f2937' }}>
                {getStatusText()}
              </h3>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                {new Date(payment.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline"
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{ 
              backgroundColor: '#C4C4C4',
              color: '#696969'
            }}
          >
            {payment.status}
          </Badge>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          {/* Amount */}
          <div 
            className="flex justify-between items-center py-3 px-4 rounded-xl"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Amount:</span>
            <div className="text-right">
              <div className="font-semibold text-lg" style={{ color: '#1f2937' }}>
                {formatCurrency(payment.amountUSD)}
              </div>
              <div className="text-xs" style={{ color: '#6b7280' }}>
                {payment.amountUSDC} USDC
              </div>
            </div>
          </div>

          {showDetails && (
            <>
              {/* Buyer Email */}
              {payment.buyerEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Buyer:</span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: '#6b7280' }} />
                    <span className="text-sm font-medium" style={{ color: '#1f2937' }}>
                      {payment.buyerEmail}
                    </span>
                  </div>
                </div>
              )}

              {/* Product */}
              {payment.productId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Product:</span>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" style={{ color: '#6b7280' }} />
                    <span className="text-sm font-medium" style={{ color: '#1f2937' }}>
                      {payment.productId.toString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Addresses */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: '#6b7280' }}>From:</span>
                <span className="font-mono text-sm" style={{ color: '#1f2937' }}>
                  {formatAddress(payment.fromAddress)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: '#6b7280' }}>To:</span>
                <span className="font-mono text-sm" style={{ color: '#1f2937' }}>
                  {formatAddress(payment.toAddress)}
                </span>
              </div>

              {/* Transaction Hash */}
              {payment.transactionHash && (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Transaction:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyTxHash}
                        className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          borderColor: '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewOnExplorer}
                        className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          borderColor: '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: '#f9fafb' }}
                  >
                    <p className="font-mono text-xs break-all" style={{ color: '#1f2937' }}>
                      {payment.transactionHash}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {payment.errorMessage && (
                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 mt-0.5" style={{ color: '#dc2626' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#dc2626' }}>Error</p>
                      <p className="text-xs mt-1" style={{ color: '#991b1b' }}>
                        {payment.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        {payment.transactionHash && (
          <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: '#f3f4f6' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOnExplorer}
              className="flex-1 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e5e7eb',
                color: '#374151'
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTxHash}
              className="h-10 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: '#f8f9fa',
                borderColor: '#e5e7eb',
                color: '#374151'
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}