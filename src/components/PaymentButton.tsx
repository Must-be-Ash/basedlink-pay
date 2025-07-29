"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  Wallet, 
  CheckCircle2, 
  Plus
} from "lucide-react"
import { toast } from "sonner"
import { useUserSession } from "@/hooks/useUserSession"
import { useTransaction } from "@/hooks/useTransaction"
import { useOnramp, useWalletBalance } from "@/hooks/useOnramp"
import type { Product, ProductWithSeller } from "@/types/product"

interface PaymentButtonProps {
  product: Product | ProductWithSeller
  onPaymentSuccess?: (data: { txHash: string; paymentId: string }) => void
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
  const { isAuthenticated, walletAddress, authCredentials } = useUserSession()
  const { sendUSDCPayment, isLoading } = useTransaction()
  const { openOnramp, isCreatingSession } = useOnramp()
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'confirming' | 'success' | 'error' | 'insufficient_balance'>('idle')
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

    // Prevent duplicate payment attempts
    if (paymentStatus === 'processing' || paymentStatus === 'confirming' || isLoading) {
      return
    }

    // Check balance before attempting payment
    if (!hasEnoughBalance) {
      setPaymentStatus('insufficient_balance')
      return
    }

    setPaymentStatus('processing')

    try {
      // Step 1: Create pending payment record
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id?.toString(),
          buyerEmail: authCredentials.email || walletAddress, // Use actual email or fallback to wallet
          buyerWalletAddress: walletAddress,
          amountUSD: product.priceUSD,
          amountUSDC: product.priceUSDC,
          fromAddress: walletAddress,
          toAddress: recipientAddress,
        }),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || 'Failed to create payment record')
      }

      const { data: payment } = await paymentResponse.json()

      // Step 2: Send the transaction
      const txHash = await sendUSDCPayment(
        recipientAddress,
        product.priceUSDC
      )
      
      setTxHash(txHash)
      setPaymentStatus('confirming')

      // Step 3: Confirm payment with blockchain verification (with retry)
      let confirmationAttempts = 0
      const maxAttempts = 3
      const retryDelay = 2000 // 2 seconds
      
      while (confirmationAttempts < maxAttempts) {
        try {
          const confirmResponse = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transactionHash: txHash,
              paymentId: payment._id, // Use direct value instead of state
            }),
          })

          if (confirmResponse.ok) {
            // Success! Break out of retry loop
            break
          }
          
          const errorData = await confirmResponse.json()
          const errorMessage = errorData.error || 'Payment confirmation failed'
          
          // If it's a confirmation issue, retry
          if (errorMessage.includes('confirmations') && confirmationAttempts < maxAttempts - 1) {
            confirmationAttempts++
            console.log(`⏳ Transaction not confirmed yet, retrying in ${retryDelay}ms... (attempt ${confirmationAttempts}/${maxAttempts})`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }
          
          // If it's not a confirmation issue or we've exceeded retries, throw error
          throw new Error(errorMessage)
          
        } catch (error) {
          if (confirmationAttempts >= maxAttempts - 1) {
            throw error
          }
          confirmationAttempts++
          console.log(`⏳ Confirmation failed, retrying in ${retryDelay}ms... (attempt ${confirmationAttempts}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }

      setPaymentStatus('success')
      onPaymentSuccess?.({ txHash, paymentId: payment._id })
      toast.success("Payment confirmed on blockchain!", { duration: 1000 })
      
    } catch (error) {
      console.error("Payment failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      
      // Check if it's a balance issue (including gas fees)
      if (errorMessage.includes("transfer amount exceeds balance") || 
          errorMessage.includes("Insufficient USDC balance") ||
          errorMessage.includes("Insufficient balance to execute the transaction") ||
          errorMessage.includes("insufficient funds")) {
        setPaymentStatus('insufficient_balance')
        recheckBalance()
      } else {
        setPaymentStatus('error')
        onPaymentError?.(errorMessage)
        toast.error(errorMessage, { duration: 1000 })
      }
    }
  }, [isAuthenticated, walletAddress, recipientAddress, hasEnoughBalance, sendUSDCPayment, product, onPaymentSuccess, onPaymentError, recheckBalance, authCredentials.email, isLoading, paymentStatus])

  const handleFundWallet = async () => {
    await openOnramp(product.priceUSDC.toString())
  }

  const resetPayment = () => {
    setPaymentStatus('idle')
    setTxHash(null)
    recheckBalance() // Refresh balance
  }

  // Payment confirming state - show transaction sent, waiting for confirmation
  if (paymentStatus === 'confirming' && txHash) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#fef3c7' }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f59e0b' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#92400e' }}>Confirming Payment...</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#b45309' }}>
            Transaction sent! Verifying on blockchain...
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
          <p className="text-xs font-mono text-center leading-relaxed" style={{ color: '#f59e0b' }}>
            Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        </div>
      </div>
    )
  }

  // Payment success state
  if (paymentStatus === 'success' && txHash) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#d1fae5' }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: '#059669' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#065f46' }}>Payment Confirmed!</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#047857' }}>
            Your payment of <span className="font-semibold">{product.priceUSDC} USDC</span> has been confirmed on blockchain.
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
          <p className="text-xs font-mono text-center leading-relaxed" style={{ color: '#059669' }}>
            Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetPayment}
          className="w-full py-2"
          style={{ 
            backgroundColor: '#f0fdf4',
            color: '#059669',
            border: '1px solid #bbf7d0'
          }}
        >
          Make Another Payment
        </Button>
      </div>
    )
  }

  // Insufficient balance state - show funding options
  if (paymentStatus === 'insufficient_balance') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Show balance info in existing format */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6b7280' }}>Amount:</span>
            <span className="font-medium" style={{ color: '#1f2937' }}>{product.priceUSDC} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#6b7280' }}>Your balance:</span>
            <span className="font-medium" style={{ color: '#dc2626' }}>
              {checkingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                formattedBalance.includes('needs ETH for gas') ? 
                  formattedBalance : 
                  `${formattedBalance} USDC`
              )}
            </span>
          </div>
          
          {/* Minimal insufficient funds notice */}
          <div className="pt-2 pb-1" style={{ borderTop: '1px solid #fee2e2' }}>
            <p className="text-xs text-center" style={{ color: '#dc2626' }}>
              {formattedBalance.includes('needs ETH for gas') ? (
                "Need ETH for transaction fees"
              ) : (
                `Insufficient balance • Need ${(product.priceUSDC - parseFloat(formattedBalance.replace(/[^\d.]/g, ''))).toFixed(2)} more USDC`
              )}
            </p>
          </div>
        </div>

        {/* Primary action button */}
        <Button3D
          onClick={handleFundWallet}
          disabled={isCreatingSession}
          variant="default"
          size="lg"
          className="w-full"
          isLoading={isCreatingSession}
        >
          {isCreatingSession ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opening Coinbase Pay...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add USDC
            </>
          )}
        </Button3D>

        {/* Minimal secondary action */}
        <button
          onClick={resetPayment}
          className="w-full text-sm py-2 hover:underline"
          style={{ color: '#6b7280' }}
        >
          Back to Payment
        </button>
      </div>
    )
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <Wallet className="mx-auto h-12 w-12" style={{ color: '#9ca3af' }} />
        <div>
          <h3 className="font-semibold text-lg mb-2" style={{ color: '#1f2937' }}>Connect Your Wallet</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
            Please connect your wallet to make a payment
          </p>
        </div>
      </div>
    )
  }

  // Default payment state
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span style={{ color: '#6b7280' }}>Amount:</span>
          <span className="font-medium" style={{ color: '#1f2937' }}>{product.priceUSDC} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#6b7280' }}>Your balance:</span>
          <span className="font-medium" style={{ color: '#1f2937' }}>
            {checkingBalance ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : (
              `${formattedBalance} USDC`
            )}
          </span>
        </div>
      </div>
      
      <Button3D
        onClick={handlePayment}
        disabled={disabled || isLoading || paymentStatus === 'processing' || paymentStatus === 'confirming' || checkingBalance}
        variant="default"
        size="lg"
        className="w-full"
        isLoading={paymentStatus === 'processing' || paymentStatus === 'confirming'}
        style={{ 
          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
        }}
      >
        {paymentStatus === 'processing' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending Payment...
          </>
        ) : paymentStatus === 'confirming' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Confirming...
          </>
        ) : (
          <>
           
            Pay {product.priceUSDC} USDC
          </>
        )}
      </Button3D>
    </div>
  )
}