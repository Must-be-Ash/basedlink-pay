"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  useSignInWithEmail,
  useVerifyEmailOTP,
  useCurrentUser,
  useSignOut,
  useIsInitialized,
  useEvmAddress,
} from "@coinbase/cdp-hooks"
import { Loader2, Mail, Shield, Copy, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { CDPUser } from "@/types/cdp"

interface WalletAuthProps {
  onAuthSuccess?: (user: CDPUser, address: string, email: string) => void
  className?: string
}

export function WalletAuth({ onAuthSuccess, className }: WalletAuthProps) {
  const isInitialized = useIsInitialized()
  const currentUser = useCurrentUser()
  const evmAddress = useEvmAddress()
  const signInWithEmail = useSignInWithEmail()
  const verifyEmailOTP = useVerifyEmailOTP()
  const signOut = useSignOut()

  const [isMounted, setIsMounted] = useState(false)
  
  // Authentication state
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [flowId, setFlowId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  
  // Track verified email for callback
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [otpVerified, setOtpVerified] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle auth success callback when user and address are available after OTP verification
  useEffect(() => {
    if (otpVerified && currentUser && evmAddress && verifiedEmail && onAuthSuccess) {
      console.log('Calling onAuthSuccess callback') // Debug log
      onAuthSuccess(currentUser, evmAddress, verifiedEmail)
      setOtpVerified(false) // Reset the flag
      setVerifiedEmail(null) // Clear the stored email
    }
  }, [otpVerified, currentUser, evmAddress, verifiedEmail, onAuthSuccess])

  // Wait for client-side mounting and SDK initialization
  if (!isMounted || !isInitialized) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <Loader2 className="h-8 w-8 animate-spin mb-4" style={{ color: '#ff5941' }} />
        <p style={{ color: '#6b7280' }}>Initializing wallet...</p>
      </div>
    )
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    try {
      const { flowId } = await signInWithEmail({ email })
      setFlowId(flowId)
      toast.success("Verification code sent to your email")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed"
      setAuthError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flowId) return

    setAuthLoading(true)
    setAuthError(null)

    try {
      console.log('Verifying OTP') // Debug log
      await verifyEmailOTP({ flowId, otp })
      
      // Store email and set verification flag
      setVerifiedEmail(email)
      setOtpVerified(true)
      
      // Reset form state
      setFlowId(null)
      setOtp("")
      setEmail("")
      toast.success("Wallet connected successfully!")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed"
      setAuthError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setEmail("")
      setOtp("")
      setFlowId(null)
      setAuthError(null)
      setVerifiedEmail(null)
      setOtpVerified(false)
      toast.success("Signed out successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed"
      setAuthError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleCopyAddress = async () => {
    if (!evmAddress) return
    
    try {
      await navigator.clipboard.writeText(evmAddress)
      setAddressCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setAddressCopied(false), 2000)
    } catch {
      toast.error("Failed to copy address")
    }
  }

  // OTP verification state
  if (flowId) {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255, 89, 65, 0.1)' }}>
            <Shield className="w-6 h-6" style={{ color: '#ff5941' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>Enter Verification Code</h3>
          <p className="mt-2" style={{ color: '#6b7280' }}>
            We sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                color: '#1f2937'
              }}
              maxLength={6}
              disabled={authLoading}
              required
              autoComplete="one-time-code"
            />
          </div>
          
          <div className="space-y-3">
            <button 
              type="submit" 
              disabled={authLoading || otp.length !== 6} 
              className="w-full py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              style={{ 
                background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                color: '#ffffff'
              }}
            >
              {authLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFlowId(null)
                setOtp("")
                setAuthError(null)
              }}
              className="w-full py-2 transition-colors"
              style={{ color: '#6b7280' }}
            >
              Back to Email
            </button>
          </div>
        </form>
        
        <p className="text-center text-xs mt-6" style={{ color: '#6b7280' }}>
          Powered by <strong>Coinbase Developer Platform</strong>
        </p>
      </div>
    )
  }

  // Authenticated state - show wallet info
  if (currentUser && evmAddress) {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#dcfce7' }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: '#16a34a' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>Wallet Connected</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>
              Email
            </label>
            <p className="font-medium" style={{ color: '#1f2937' }}>{(currentUser as CDPUser)?.email || 'User'}</p>
          </div>
          
          <div className="rounded-xl p-4" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <label className="block text-sm font-medium mb-1" style={{ color: '#6b7280' }}>
              Wallet Address
            </label>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm" style={{ color: '#1f2937' }}>
                {`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}
              </span>
              <button
                onClick={handleCopyAddress}
                className="ml-2 p-1 rounded transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: addressCopied ? '#dcfce7' : '#f8f9fa' }}
                title="Copy full address"
              >
                {addressCopied ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                ) : (
                  <Copy className="w-4 h-4" style={{ color: '#6b7280' }} />
                )}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSignOut} 
          className="w-full mt-6 py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          style={{ 
            backgroundColor: '#f8f9fa',
            borderColor: '#e5e7eb',
            color: '#374151',
            border: '1px solid #e5e7eb'
          }}
        >
          Sign Out
        </button>
      </div>
    )
  }

  // Email sign-in state
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255, 89, 65, 0.1)' }}>
          <Mail className="w-6 h-6" style={{ color: '#ff5941' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>Connect Your Wallet</h3>
        <p className="mt-2" style={{ color: '#6b7280' }}>
          Sign in with your email to access your embedded wallet
        </p>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
          {authError}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border transition-all duration-200"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#e5e7eb',
              color: '#1f2937'
            }}
            disabled={authLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={authLoading || !email} 
          className="w-full py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          style={{ 
            background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
            color: '#ffffff'
          }}
        >
          {authLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Sending...
            </div>
          ) : (
            "Sign In with Coinbase"
          )}
        </button>
      </form>
      
      <p className="text-center text-xs mt-6" style={{ color: '#6b7280' }}>
        Powered by <strong>Coinbase Developer Platform</strong>
      </p>
    </div>
  )
}