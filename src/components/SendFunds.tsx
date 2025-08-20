"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useTransaction } from "@/hooks/useTransaction"
import { useWalletBalance } from "@/hooks/useOnramp"
import { sendFundsSchema } from "@/lib/validation"
import { formatAddress } from "@/lib/utils"
import { toast } from "sonner"
import {
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle
} from "lucide-react"

interface SendFundsProps {
  onSuccess?: () => void
}

export function SendFunds({ onSuccess }: SendFundsProps) {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    recipientAddress?: string
    amount?: string
  }>({})

  const { sendUSDCPayment, isLoading, txHash, error, clearError } = useTransaction()
  
  // Get current balance to validate against
  const {
    currentBalance,
    formattedBalance,
    isChecking: checkingBalance,
    recheckBalance
  } = useWalletBalance("0") // We just want to get the current balance

  const validateForm = () => {
    setValidationErrors({})
    clearError()

    try {
      const numAmount = parseFloat(amount)
      // Convert currentBalance from wei to USDC for comparison
      const currentBalanceNum = parseFloat(currentBalance) / 1e6

      // Basic validation with Zod
      sendFundsSchema.parse({
        recipientAddress,
        amount: numAmount
      })

      // Additional balance validation
      if (numAmount > currentBalanceNum) {
        setValidationErrors({ amount: "Insufficient balance" })
        return false
      }

      return true
    } catch (error: unknown) {
      const fieldErrors: { recipientAddress?: string; amount?: string } = {}
      
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
        error.errors.forEach((err: { path: string[]; message: string }) => {
          if (err.path[0] === 'recipientAddress') {
            fieldErrors.recipientAddress = err.message
          } else if (err.path[0] === 'amount') {
            fieldErrors.amount = err.message
          }
        })
      }
      
      setValidationErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setShowConfirmDialog(true)
  }

  const handleConfirmSend = async () => {
    setShowConfirmDialog(false)

    try {
      const txHash = await sendUSDCPayment(recipientAddress, parseFloat(amount))
      
      toast.success("Funds sent successfully!", {
        action: {
          label: "View Transaction",
          onClick: () => window.open(`https://basescan.org/tx/${txHash}`, '_blank')
        }
      })
      
      // Reset form
      setRecipientAddress("")
      setAmount("")
      setValidationErrors({})
      
      // Refresh balance
      recheckBalance()
      
      // Call success callback if provided
      onSuccess?.()
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send funds")
    }
  }

  const handleMaxAmount = () => {
    if (currentBalance && parseFloat(currentBalance) > 0) {
      // Convert from wei (6 decimals for USDC) to USDC
      const balanceInUsdc = parseFloat(currentBalance) / 1e6
      // No buffer needed since gas is paid in ETH, not USDC
      setAmount(balanceInUsdc.toFixed(6)) // Use 6 decimals for precision, will display as needed
    }
  }

  const isFormValid = recipientAddress && amount && Object.keys(validationErrors).length === 0

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-semibold mb-2" style={{ color: '#1f2937' }}>
          Send Funds
        </h4>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Send USDC from your wallet to any address
        </p>
      </div>

      {/* Balance Display */}
      <div 
        className="p-4 rounded-xl"
        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: '#374151' }}>
            Available Balance:
          </span>
          <span className="text-sm font-mono" style={{ color: '#1f2937' }}>
            {checkingBalance ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `${formattedBalance} USDC`
            )}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient-address" className="text-sm font-medium" style={{ color: '#374151' }}>
            Recipient Address <span style={{ color: '#dc2626' }}>*</span>
          </Label>
          <Input
            id="recipient-address"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            disabled={isLoading}
            className="h-12 rounded-xl border transition-all duration-200 font-mono"
            style={{
              backgroundColor: '#ffffff',
              borderColor: validationErrors.recipientAddress ? '#dc2626' : '#e5e7eb',
              color: '#1f2937'
            }}
          />
          {validationErrors.recipientAddress && (
            <p className="text-xs flex items-center" style={{ color: '#dc2626' }}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {validationErrors.recipientAddress}
            </p>
          )}
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Enter the wallet address where you want to send the funds
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium" style={{ color: '#374151' }}>
            Amount (USDC) <span style={{ color: '#dc2626' }}>*</span>
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
              step="0.000001"
              min="0.000001"
              className="h-12 rounded-xl border transition-all duration-200 pr-16"
              style={{
                backgroundColor: '#ffffff',
                borderColor: validationErrors.amount ? '#dc2626' : '#e5e7eb',
                color: '#1f2937'
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMaxAmount}
              disabled={isLoading || checkingBalance}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 text-xs rounded-lg"
              style={{
                backgroundColor: '#f8f9fa',
                borderColor: '#e5e7eb',
                color: '#374151'
              }}
            >
              Max
            </Button>
          </div>
          {validationErrors.amount && (
            <p className="text-xs flex items-center" style={{ color: '#dc2626' }}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {validationErrors.amount}
            </p>
          )}
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Minimum amount: 0.000001 USDC
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div 
            className="p-4 rounded-xl flex items-center"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <AlertCircle className="w-4 h-4 mr-3" style={{ color: '#dc2626' }} />
            <span className="text-sm" style={{ color: '#dc2626' }}>
              {error}
            </span>
          </div>
        )}

        {/* Success Display */}
        {txHash && (
          <div 
            className="p-4 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}
          >
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-3" style={{ color: '#0ea5e9' }} />
              <span className="text-sm font-medium" style={{ color: '#0ea5e9' }}>
                Transaction successful!
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://basescan.org/tx/${txHash}`, '_blank')}
              className="h-8 px-3 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        )}

        {/* Submit Button */}
        <Button3D
          type="submit"
          disabled={!isFormValid || isLoading}
          className="text-white text-base px-6 py-3 h-auto rounded-xl font-medium w-full transition-all duration-200"
          style={{ 
            background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Funds
            </>
          )}
        </Button3D>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the transaction details:
            </AlertDialogDescription>
            <div className="space-y-2 p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="flex justify-between">
                <span className="text-sm font-medium" style={{ color: '#6b7280' }}>To:</span>
                <span className="text-sm font-mono" style={{ color: '#1f2937' }}>
                  {formatAddress(recipientAddress)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Amount:</span>
                <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
                  {amount} USDC
                </span>
              </div>
            </div>
            <div className="text-sm" style={{ color: '#6b7280' }}>
              This action cannot be undone. Make sure the recipient address is correct.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSend}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Send Funds
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}