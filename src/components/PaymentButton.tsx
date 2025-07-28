"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from "lucide-react"
import { toast } from "sonner"
import { useUserSession } from "@/hooks/useUserSession"
import { useTransaction } from "@/hooks/useTransaction"
import { useOnramp, useWalletBalance } from "@/hooks/useOnramp"
import type { Product, ProductWithSeller } from "@/types/product"

interface PaymentButtonProps {
  product: Product | ProductWithSeller
  onPaymentSuccess?: (txHash: string) => void
  onPaymentError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function PaymentButton({ 
  product, 
  onPaymentSuccess, 
  onPaymentError, 
  disabled = false,
  className 
}: PaymentButtonProps) {
  const { isAuthenticated, walletAddress } = useUserSession()
  const { sendUSDCPayment, isLoading } = useTransaction()
  const { openOnramp, isCreatingSession } = useOnramp()
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'insufficient_balance'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  // Use the new useWalletBalance hook
  const { 
    hasEnoughBalance, 
    formattedBalance, 
    isChecking: checkingBalance,
    recheckBalance 
  } = useWalletBalance(product.priceUSDC.toString())

  const getRecipientAddress = () => {
    if (product.recipientAddress) return product.recipientAddress
    if (product.ownerAddress) return product.ownerAddress
    if ('seller' in product && product.seller?.walletAddress) {
      return product.seller.walletAddress
    }
    return null
  }

  const recipientAddress = getRecipientAddress()

  const handlePayment = useCallback(async () => {
    if (!isAuthenticated || !walletAddress) {
      toast.error("Please connect your wallet first", { duration: 1000 })
      return
    }

    if (!recipientAddress) {
      toast.error("No recipient address configured for this product", { duration: 1000 })
      return
    }

    // Check balance before attempting payment
    if (!hasEnoughBalance) {
      setPaymentStatus('insufficient_balance')
      return
    }

    setPaymentStatus('processing')

    try {
      const txHash = await sendUSDCPayment(
        recipientAddress,
        product.priceUSDC
      )
      
      setTxHash(txHash)
      setPaymentStatus('success')
      onPaymentSuccess?.(txHash)
      toast.success("Payment sent successfully!", { duration: 1000 })
    } catch (error) {
      console.error("Payment failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      
      // Check again if it's a balance issue (double-check)
      if (errorMessage.includes("transfer amount exceeds balance") || 
          errorMessage.includes("Insufficient USDC balance")) {
        setPaymentStatus('insufficient_balance')
        recheckBalance()
      } else {
        setPaymentStatus('error')
        onPaymentError?.(errorMessage)
        toast.error(errorMessage, { duration: 1000 })
      }
    }
  }, [isAuthenticated, walletAddress, recipientAddress, hasEnoughBalance, sendUSDCPayment, product.priceUSDC, onPaymentSuccess, onPaymentError, recheckBalance])

  const handleFundWallet = async () => {
    await openOnramp(product.priceUSDC.toString())
  }

  const resetPayment = () => {
    setPaymentStatus('idle')
    setTxHash(null)
    recheckBalance() // Refresh balance
  }

  // Payment success state
  if (paymentStatus === 'success' && txHash) {
    return (
      <div className={className}>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg text-green-800">Payment Successful!</CardTitle>
            <p className="text-sm text-green-700">
              Your payment of {product.priceUSDC} USDC has been sent.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-green-600 font-mono mb-3">
              Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPayment}
              className="text-green-700 hover:text-green-800"
            >
              Make Another Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Insufficient balance state - show funding options
  if (paymentStatus === 'insufficient_balance') {
    return (
      <div className={className}>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg text-orange-800">Insufficient USDC Balance</CardTitle>
            <p className="text-sm text-orange-700">
              You need {product.priceUSDC} USDC but only have {formattedBalance} USDC
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Add USDC to your wallet to complete the payment:
              </p>
            </div>

            {/* Single funding button - Coinbase handles guest checkout internally */}
            <Button
              onClick={handleFundWallet}
              disabled={isCreatingSession}
              className="w-full"
              size="lg"
            >
              {isCreatingSession ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Opening Coinbase Pay...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add USDC with Coinbase
                </>
              )}
            </Button>

            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPayment}
                className="flex-1"
              >
                Back to Payment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={recheckBalance}
                className="flex-1"
              >
                Refresh Balance
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground mt-4">
              <p>💳 Buy with card or bank • 👤 Guest checkout available • 🔒 Secure on Base network</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Please connect your wallet to make a payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default payment state
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Payment Details</CardTitle>
            <Badge variant="secondary">{product.priceUSDC} USDC</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{product.priceUSDC} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">Base</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your balance:</span>
            <span className="font-medium">
              {checkingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                `${formattedBalance} USDC`
              )}
            </span>
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={disabled || isLoading || paymentStatus === 'processing' || checkingBalance}
            className="w-full"
            size="lg"
          >
            {paymentStatus === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay {product.priceUSDC} USDC
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}