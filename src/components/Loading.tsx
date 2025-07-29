import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="relative">
        <Loader2 
          className={cn("animate-spin", sizeClasses[size])} 
          style={{ color: '#ff5941' }}
        />
        {/* Optional: Add a subtle glow effect */}
        <div 
          className={cn("absolute inset-0 animate-spin", sizeClasses[size])}
          style={{
            background: 'radial-gradient(circle, rgba(255, 89, 65, 0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          }}
        />
      </div>
      {text && (
        <p 
          className="text-sm font-medium animate-pulse"
          style={{ color: '#6b7280' }}
        >
          {text}
        </p>
      )}
    </div>
  )
}

interface PageLoadingProps {
  text?: string
}

export function PageLoading({ text = "Loading..." }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F2F2' }}>
      <div 
        className="p-8 rounded-2xl transition-all duration-300"
        style={{ 
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}

interface InlineLoadingProps {
  text?: string
  className?: string
}

export function InlineLoading({ text, className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <Loader2 
          className="w-4 h-4 animate-spin" 
          style={{ color: '#ff5941' }}
        />
        <div 
          className="absolute inset-0 w-4 h-4 animate-spin"
          style={{
            background: 'radial-gradient(circle, rgba(255, 89, 65, 0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          }}
        />
      </div>
      {text && (
        <span 
          className="text-sm font-medium"
          style={{ color: '#6b7280' }}
        >
          {text}
        </span>
      )}
    </div>
  )
}