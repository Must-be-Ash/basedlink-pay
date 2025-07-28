"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogFooterProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogActionProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

interface AlertDialogCancelProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  )
}

const AlertDialogContent = ({ className, children, ...props }: AlertDialogContentProps) => (
  <div
    className={cn(
      "bg-background border rounded-lg shadow-lg p-6 space-y-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const AlertDialogHeader = ({ className, children, ...props }: AlertDialogHeaderProps) => (
  <div
    className={cn("space-y-2", className)}
    {...props}
  >
    {children}
  </div>
)

const AlertDialogTitle = ({ className, children, ...props }: AlertDialogTitleProps) => (
  <h2
    className={cn("text-lg font-semibold", className)}
    {...props}
  >
    {children}
  </h2>
)

const AlertDialogDescription = ({ className, children, ...props }: AlertDialogDescriptionProps) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
)

const AlertDialogFooter = ({ className, children, ...props }: AlertDialogFooterProps) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0", className)}
    {...props}
  >
    {children}
  </div>
)

const AlertDialogAction = ({ className, children, onClick, disabled, ...props }: AlertDialogActionProps) => (
  <Button
    className={cn(className)}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </Button>
)

const AlertDialogCancel = ({ className, children, onClick, ...props }: AlertDialogCancelProps) => (
  <Button
    variant="outline"
    className={cn(className)}
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
)

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
}