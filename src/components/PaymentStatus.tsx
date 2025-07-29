import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
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
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#1f2937' }}>
                {getStatusText()}
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                {new Date(payment.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline"
            className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full"
            style={{ 
              backgroundColor: '#C4C4C4',
              color: '#696969'
            }}
          >
            {payment.status}
          </Badge>
        </div>

        {/* Payment Details */}
        <div className="space-y-3 sm:space-y-4">
          {/* Amount */}
          <div 
            className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Amount:</span>
            <div className="text-right">
              <div className="font-semibold text-lg sm:text-xl" style={{ color: '#1f2937' }}>
                {formatCurrency(payment.amountUSDC)}
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
                  <div className="flex items-center gap-2 flex-1 min-w-0 ml-2">
                    <User className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />
                    <span className="text-sm font-medium truncate" style={{ color: '#1f2937' }}>
                      {payment.buyerEmail}
                    </span>
                  </div>
                </div>
              )}

              {/* Product */}
              {payment.productId && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium flex-shrink-0" style={{ color: '#6b7280' }}>Product:</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0 ml-2">
                    <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />
                    <span className="text-sm font-medium font-mono break-all" style={{ color: '#1f2937' }}>
                      {payment.productId.toString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              {payment.transactionHash && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium flex-shrink-0" style={{ color: '#6b7280' }}>Transaction:</span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyTxHash}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          borderColor: '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewOnExplorer}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          borderColor: '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </div>
                  <div 
                    className="p-2 sm:p-3 rounded-xl"
                    style={{ backgroundColor: '#f9fafb' }}
                  >
                    <p className="font-mono text-xs sm:text-sm break-all leading-relaxed" style={{ color: '#1f2937' }}>
                      {payment.transactionHash}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {payment.errorMessage && (
                <div 
                  className="p-3 sm:p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca'
                  }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#dc2626' }}>Error</p>
                      <p className="text-xs mt-1 break-words" style={{ color: '#991b1b' }}>
                        {payment.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}