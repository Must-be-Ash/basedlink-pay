"use client"

import { useState } from "react"
import { useEvmAddress, useSendEvmTransaction } from "@coinbase/cdp-hooks"
import { toast } from "sonner"

export function useTransaction() {
  const evmAddress = useEvmAddress()
  const sendTransaction = useSendEvmTransaction()
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sendUSDCPayment = async (toAddress: string, usdcAmount: number): Promise<string> => {
    if (!evmAddress) {
      const errorMsg = "No wallet connected"
      setError(errorMsg)
      toast.error(errorMsg)
      throw new Error(errorMsg)
    }

    setIsLoading(true)
    setError(null)
    setTxHash(null)

    try {
      // Convert USDC amount to wei (USDC has 6 decimals)
      const valueInUSDC = BigInt(Math.floor(usdcAmount * 1e6))
      const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC

      // ERC-20 transfer function signature and data
      const transferMethodId = "0xa9059cbb" // transfer(address,uint256)
      const paddedAddress = toAddress.slice(2).padStart(64, '0')
      const paddedAmount = valueInUSDC.toString(16).padStart(64, '0')
      const data = transferMethodId + paddedAddress + paddedAmount

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: USDC_CONTRACT_ADDRESS as `0x${string}`,
          data: data as `0x${string}`,
          chainId: 8453, // Base mainnet
          type: "eip1559",
        },
        network: "base",
      })

      setTxHash(result.transactionHash)
      toast.success("Payment sent successfully!")
      return result.transactionHash
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Transaction failed"
      setError(errorMsg)
      toast.error(errorMsg, { duration: 1000 })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sendETHPayment = async (toAddress: string, ethAmount: number): Promise<string> => {
    if (!evmAddress) {
      const errorMsg = "No wallet connected"
      setError(errorMsg)
      toast.error(errorMsg)
      throw new Error(errorMsg)
    }

    setIsLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const valueInWei = BigInt(Math.floor(ethAmount * 1e18))

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: toAddress as `0x${string}`,
          value: valueInWei,
          chainId: 8453, // Base mainnet
          type: "eip1559",
        },
        network: "base",
      })

      setTxHash(result.transactionHash)
      toast.success("Payment sent successfully!")
      return result.transactionHash
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Transaction failed"
      setError(errorMsg)
      toast.error(errorMsg)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendUSDCPayment,
    sendETHPayment,
    isLoading,
    txHash,
    error,
    clearError: () => setError(null),
    clearTxHash: () => setTxHash(null)
  }
}