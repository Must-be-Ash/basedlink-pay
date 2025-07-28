import React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  className?: string
}

export function Container({ children, size = "lg", className }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none"
  }

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-8 sm:py-12 lg:py-16", className)}>
      {children}
    </section>
  )
}