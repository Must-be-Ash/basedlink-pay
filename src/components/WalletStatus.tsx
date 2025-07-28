"use client"

import { useUserSession } from "@/hooks/useUserSession"
import { formatAddress } from "@/lib/utils"
import { Wallet, User, ExternalLink } from "lucide-react"

export function WalletStatus() {
  const { user, walletAddress, isLoading, isAuthenticated } = useUserSession()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading wallet...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Wallet className="w-4 h-4" />
        <span className="text-sm">No wallet connected</span>
      </div>
    )
  }

  const baseExplorerUrl = "https://basescan.org/address"

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{user?.name || user?.email}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Wallet className="w-4 h-4 text-primary" />
        <a
          href={`${baseExplorerUrl}/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono hover:text-primary transition-colors flex items-center space-x-1"
        >
          <span>{formatAddress(walletAddress!)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}