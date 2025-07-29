"use client"

import React, { useState, useRef, useEffect } from "react"

import { useUserSession } from "@/hooks/useUserSession"
import { formatAddress } from "@/lib/utils"
import { 
  Wallet, 
  User, 
  Copy, 
  CheckCircle2, 
  LogOut, 
  Settings, 
  Zap,
  ShoppingBag,
  DollarSign,
  Home
} from "lucide-react"
import Image from "next/image"
import { useSignOut } from "@coinbase/cdp-hooks"
import { toast } from "sonner"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { isAuthenticated, walletAddress, user } = useUserSession()
  const signOut = useSignOut()
  const router = useRouter()
  const pathname = usePathname()
  const [addressCopied, setAddressCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

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

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <header 
      className={`pt-5 relative z-[9999] ${className}`}
      style={{ 
        backgroundColor: '#F2F2F2'
      }}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-center">
        {/* Unified Dock */}
        <motion.div
          className="flex items-center gap-2 p-2 rounded-2xl backdrop-blur-lg border shadow-lg"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#f3f4f6'
          }}
          initial={{ y: 0 }}
          animate={{ 
            y: [-1, 1, -1],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {/* Logo */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <Link 
              href="/" 
              className="flex items-center justify-center p-3 rounded-lg transition-all duration-75"
              style={{ 
                backgroundColor: isActive('/') ? '#f8f9fa' : 'transparent'
              }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
            </Link>
            <span 
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
              style={{ 
                backgroundColor: '#1f2937',
                color: '#ffffff'
              }}
            >
              StableLink
            </span>
          </motion.div>

          {/* Divider */}
          <div 
            className="w-px h-8 mx-1"
            style={{ backgroundColor: '#e5e7eb' }}
          />

          {/* Navigation Items */}
       

          <motion.button
            onClick={() => handleNavigation('/dashboard')}
            className="relative group p-3 rounded-lg transition-all duration-75"
            style={{ 
              backgroundColor: isActive('/dashboard') ? '#f8f9fa' : 'transparent'
            }}
            whileHover={{ 
              scale: 1.1, 
              y: -2,
              backgroundColor: '#f8f9fa'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <Home 
              className="w-5 h-5" 
              style={{ 
                color: isActive('/dashboard') ? '#ff5941' : '#374151'
              }} 
            />
            <span 
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
              style={{ 
                backgroundColor: '#1f2937',
                color: '#ffffff'
              }}
            >
              Dashboard
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleNavigation('/products')}
            className="relative group p-3 rounded-lg transition-all duration-75"
            style={{ 
              backgroundColor: isActive('/products') ? '#f8f9fa' : 'transparent'
            }}
            whileHover={{ 
              scale: 1.1, 
              y: -2,
              backgroundColor: '#f8f9fa'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <ShoppingBag 
              className="w-5 h-5" 
              style={{ 
                color: isActive('/products') ? '#ff5941' : '#374151'
              }} 
            />
            <span 
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
              style={{ 
                backgroundColor: '#1f2937',
                color: '#ffffff'
              }}
            >
              Products
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleNavigation('/payments')}
            className="relative group p-3 rounded-lg transition-all duration-75"
            style={{ 
              backgroundColor: isActive('/payments') ? '#f8f9fa' : 'transparent'
            }}
            whileHover={{ 
              scale: 1.1, 
              y: -2,
              backgroundColor: '#f8f9fa'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <DollarSign 
              className="w-5 h-5" 
              style={{ 
                color: isActive('/payments') ? '#ff5941' : '#374151'
              }} 
            />
            <span 
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
              style={{ 
                backgroundColor: '#1f2937',
                color: '#ffffff'
              }}
            >
              Payments
            </span>
          </motion.button>

          {/* Settings */}
          <motion.button
            onClick={() => handleNavigation('/settings')}
            className="relative group p-3 rounded-lg transition-all duration-75"
            style={{ 
              backgroundColor: isActive('/settings') ? '#f8f9fa' : 'transparent'
            }}
            whileHover={{ 
              scale: 1.1, 
              y: -2,
              backgroundColor: '#f8f9fa'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <Settings 
              className="w-5 h-5" 
              style={{ 
                color: isActive('/settings') ? '#ff5941' : '#374151'
              }} 
            />
            <span 
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
              style={{ 
                backgroundColor: '#1f2937',
                color: '#ffffff'
              }}
            >
              Settings
            </span>
          </motion.button>

          {/* Divider */}
          <div 
            className="w-px h-8 mx-1"
            style={{ backgroundColor: '#e5e7eb' }}
          />

          {/* User Section */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative group flex items-center justify-center p-3 rounded-lg transition-all duration-75"
                style={{ backgroundColor: 'transparent' }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -2,
                  backgroundColor: '#f8f9fa'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  {user?.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={user.name || 'User'}
                      width={24}
                      height={24}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <User className="w-4 h-4" style={{ color: '#ff5941' }} />
                  )}
                </div>
                <span 
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
                  style={{ 
                    backgroundColor: '#1f2937',
                    color: '#ffffff'
                  }}
                >
                  Profile
                </span>
              </motion.button>

              {showDropdown && (
                <motion.div 
                  className="absolute right-0 mt-3 w-72 border-0 rounded-2xl shadow-xl z-[9999]"
                  style={{ 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                  }}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-6">
                    {/* User Info Header */}
                    <div className="pb-4 border-b" style={{ borderColor: '#f3f4f6' }}>
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: '#f8f8f8' }}
                        >
                          {user?.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt={user.name || 'User'}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full rounded-xl"
                            />
                          ) : (
                            <User className="w-6 h-6" style={{ color: '#ff5941' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate" style={{ color: '#1f2937' }}>
                            {user?.name || 'User'}
                          </div>
                          <div className="text-sm truncate" style={{ color: '#6b7280' }}>
                            @{user?.username || 'username'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Wallet Address */}
                      {walletAddress && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#f3f4f6' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>
                                Wallet Address
                              </div>
                              <div className="text-sm font-mono truncate" style={{ color: '#1f2937' }}>
                                {formatAddress(walletAddress)}
                              </div>
                            </div>
                            <motion.button
                              onClick={handleCopyAddress}
                              className="ml-3 p-2 rounded-lg"
                              style={{ backgroundColor: '#f8f9fa' }}
                              title="Copy wallet address"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {addressCopied ? (
                                <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                              ) : (
                                <Copy className="w-4 h-4" style={{ color: '#6b7280' }} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="pt-4 space-y-2">
                      <motion.button
                        onClick={handleDashboard}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          color: '#374151'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Dashboard
                      </motion.button>
                      <motion.button
                        onClick={handleSettings}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          color: '#374151'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </motion.button>
                      
                      <div className="pt-2 mt-4 border-t" style={{ borderColor: '#f3f4f6' }}>
                        <motion.button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl"
                          style={{ 
                            backgroundColor: '#fef2f2',
                            color: '#dc2626'
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
                              <Link href="/auth" className="flex items-center justify-center p-3 rounded-lg transition-all duration-75">
                <Wallet className="w-5 h-5" style={{ color: '#ff5941' }} />
              </Link>
                              <span 
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999]"
                  style={{ 
                    backgroundColor: '#1f2937',
                    color: '#ffffff'
                  }}
                >
                  Connect Wallet
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </header>
  )
}