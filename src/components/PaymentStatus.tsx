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
  AlertCircle
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
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (payment.status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
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
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold">{getStatusText()}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(payment.createdAt).toLocaleDateString()} at {' '}
                {new Date(payment.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <Badge variant={getStatusColor() as "success" | "warning" | "destructive" | "secondary"}>
            {payment.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <div className="text-right">
              <div className="font-semibold">
                {formatCurrency(payment.amountUSD)}
              </div>
              <div className="text-xs text-muted-foreground">
                {payment.amountUSDC} USDC
              </div>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">From:</span>
                <span className="font-mono text-sm">
                  {formatAddress(payment.fromAddress)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">To:</span>
                <span className="font-mono text-sm">
                  {formatAddress(payment.toAddress)}
                </span>
              </div>

              {payment.transactionHash && (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Transaction:</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyTxHash}
                        className="h-auto p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewOnExplorer}
                        className="h-auto p-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="font-mono text-xs break-all">
                      {payment.transactionHash}
                    </p>
                  </div>
                </div>
              )}

              {payment.productId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Product:</span>
                  <span className="text-sm">
                    {payment.productId.toString()}
                  </span>
                </div>
              )}

              {payment.errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Error</p>
                      <p className="text-xs text-destructive/80">
                        {payment.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {payment.transactionHash && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOnExplorer}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTxHash}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}