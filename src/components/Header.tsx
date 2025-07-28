"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUserSession } from "@/hooks/useUserSession"
import { formatAddress } from "@/lib/utils"
import { Wallet, User, Menu, Copy, CheckCircle2, LogOut, LayoutDashboard, Settings } from "lucide-react"
import Image from "next/image"
import { useSignOut } from "@coinbase/cdp-hooks"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { isAuthenticated, walletAddress, user } = useUserSession()
  const signOut = useSignOut()
  const router = useRouter()
  const [addressCopied, setAddressCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopyAddress = async () => {
    if (!walletAddress) return
    try {
      await navigator.clipboard.writeText(walletAddress)
      setAddressCopied(true)
      toast.success("Wallet address copied to clipboard", { duration: 1000 })
      setTimeout(() => setAddressCopied(false), 1000)
    } catch {
      toast.error("Failed to copy address", { duration: 1000 })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowDropdown(false)
      toast.success("Signed out successfully", { duration: 1000 })
    } catch {
      toast.error("Failed to sign out", { duration: 1000 })
    }
  }

  const handleDashboard = () => {
    setShowDropdown(false)
    router.push('/dashboard')
  }

  const handleSettings = () => {
    setShowDropdown(false)
    router.push('/settings')
  }

  return (
    <header className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BL</span>
            </div>
            <span className="font-bold text-xl">BasedLink</span>
          </Link>
          
          <Badge variant="outline" className="hidden sm:inline-flex">
            Beta
          </Badge>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/payments" className="text-sm font-medium hover:text-primary transition-colors">
            Payments
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                {/* Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors overflow-hidden"
                    title="User menu"
                  >
                    {user?.profileImageUrl ? (
                      <Image
                        src={user.profileImageUrl}
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-background border rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                              {user?.profileImageUrl ? (
                                <Image
                                  src={user.profileImageUrl}
                                  alt={user.name || 'User'}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <User className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">
                                {user?.name || 'User'}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                @{user?.username || 'username'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Wallet Address */}
                          {walletAddress && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-muted-foreground mb-1">Wallet Address</div>
                                  <div className="text-xs font-mono text-foreground truncate">
                                    {formatAddress(walletAddress)}
                                  </div>
                                </div>
                                <button
                                  onClick={handleCopyAddress}
                                  className="ml-2 p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                  title="Copy wallet address"
                                >
                                  {addressCopied ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={handleDashboard}
                            className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3" />
                            Dashboard
                          </button>
                          <button
                            onClick={handleSettings}
                            className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </button>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="sm:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}