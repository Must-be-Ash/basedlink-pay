import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import type { Product } from "@/types/product"

interface DeleteProductModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  product: Product
}

export function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  product
}: DeleteProductModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  
  const productName = product.name
  const isConfirmationValid = confirmText === productName

  const handleConfirm = async () => {
    if (!isConfirmationValid) return
    
    try {
      setIsDeleting(true)
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Product
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the product and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Warning:</strong> Deleting this product will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove the product permanently</li>
                <li>Break existing payment links</li>
                <li>Remove all payment history</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Product Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Product to delete:</div>
            <div className="font-semibold">{productName}</div>
            <div className="text-sm text-muted-foreground">
              Link: /pay/{product.slug}
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <span className="font-mono font-semibold">{productName}</span> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${productName}" to confirm`}
              disabled={isDeleting}
              className={confirmText && !isConfirmationValid ? "border-destructive" : ""}
            />
            {confirmText && !isConfirmationValid && (
              <p className="text-sm text-destructive">
                Product name doesn&apos;t match. Please type exactly: {productName}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 