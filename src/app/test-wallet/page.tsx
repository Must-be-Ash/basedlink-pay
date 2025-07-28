"use client"

import { WalletAuth } from "@/components/WalletAuth"
import { WalletStatus } from "@/components/WalletStatus"
import { useUserSession } from "@/hooks/useUserSession"
import { useTransaction } from "@/hooks/useTransaction"
import { useState } from "react"
import { toast } from "sonner"

export default function TestWalletPage() {
  const { isAuthenticated, user, walletAddress } = useUserSession()
  const { sendUSDCPayment, isLoading } = useTransaction()
  const [testAddress, setTestAddress] = useState("0x742d35Cc6C28173C7F4B6A3Bb1Ec8480993e85ba")
  const [testAmount, setTestAmount] = useState(1)

  const handleTestPayment = async () => {
    if (!testAddress || !testAmount) {
      toast.error("Please enter a valid address and amount")
      return
    }

    try {
      const txHash = await sendUSDCPayment(testAddress, testAmount)
      toast.success(`Payment sent! Tx: ${txHash}`)
    } catch (error) {
      console.error("Payment failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">CDP Wallet Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the Coinbase Developer Platform wallet integration
          </p>
        </div>

        {!isAuthenticated ? (
          <WalletAuth />
        ) : (
          <div className="space-y-8">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
              <WalletStatus />
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">User Info</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Full Address:</strong> <code className="wallet-address">{walletAddress}</code></p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test USDC Payment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value))}
                    placeholder="1.0"
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <button
                  onClick={handleTestPayment}
                  disabled={isLoading || !testAddress || !testAmount}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  {isLoading ? "Sending..." : `Send ${testAmount} USDC`}
                </button>
                
                <p className="text-xs text-muted-foreground">
                  ⚠️ This will send real USDC on Base mainnet. Use small amounts for testing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}