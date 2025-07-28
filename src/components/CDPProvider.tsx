"use client"

import type React from "react"
import { CDPHooksProvider } from "@coinbase/cdp-hooks"
import { useEffect, useState } from "react"

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "",
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: process.env.NODE_ENV === 'development',
}

export function CDPProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Validate environment variable on client side
    if (!process.env.NEXT_PUBLIC_CDP_PROJECT_ID) {
      console.error("NEXT_PUBLIC_CDP_PROJECT_ID environment variable is not set")
    }
  }, [])

  // Prevent SSR issues by only rendering the provider on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Initializing wallet services...</p>
        </div>
      </div>
    )
  }

  return <CDPHooksProvider config={cdpConfig}>{children}</CDPHooksProvider>
}