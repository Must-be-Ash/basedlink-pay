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
      console.log('Calling onAuthSuccess with email:', verifiedEmail) // Debug log
      onAuthSuccess(currentUser, evmAddress, verifiedEmail)
      setOtpVerified(false) // Reset the flag
      setVerifiedEmail(null) // Clear the stored email
    }
  }, [otpVerified, currentUser, evmAddress, verifiedEmail, onAuthSuccess])

  // Wait for client-side mounting and SDK initialization
  if (!isMounted || !isInitialized) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Initializing wallet...</p>
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
      console.log('Verifying OTP for email:', email) // Debug log
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
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Enter Verification Code</h3>
          <p className="text-muted-foreground mt-2">
            We sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {authError && (
          <div className="error-message mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
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
              className="w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Email
            </button>
          </div>
        </form>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
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
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Wallet Connected</h3>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email
            </label>
            <p className="font-medium">{(currentUser as CDPUser)?.email || 'User'}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Wallet Address
            </label>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}
              </span>
              <button
                onClick={handleCopyAddress}
                className="ml-2 p-1 hover:bg-muted rounded transition-colors"
                title="Copy full address"
              >
                {addressCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSignOut} 
          className="w-full mt-6 border border-input py-2 px-4 rounded-lg hover:bg-muted transition-colors"
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
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
        <p className="text-muted-foreground mt-2">
          Sign in with your email to access your embedded wallet
        </p>
      </div>

      {authError && (
        <div className="error-message mb-4">
          {authError}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={authLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={authLoading || !email} 
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
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
      
      <p className="text-center text-xs text-muted-foreground mt-6">
        Powered by <strong>Coinbase Developer Platform</strong>
      </p>
    </div>
  )
}