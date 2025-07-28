"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useUserSession } from "@/hooks/useUserSession"
import { formatAddress, cn } from "@/lib/utils"
import { 
  User, 
  Wallet, 
  Save,
  Copy,
  ExternalLink,
  Camera,
  Upload,
  Loader2,
  Check,
  X,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, user, walletAddress, updateUser } = useUserSession()
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: ''
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [, setCopySuccess] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    message: string
  }>({
    checking: false,
    available: null,
    message: ''
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        bio: user.bio || ''
      })
      setImagePreview(user.profileImageUrl || null)
    }
  }, [user])

  // Check username availability
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '' })
      return
    }

    if (username === user?.username) {
      setUsernameStatus({ checking: false, available: true, message: 'Current username' })
      return
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking...' })

    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}&excludeUserId=${user?._id}`)
      const { data } = await response.json()
      
      setUsernameStatus({
        checking: false,
        available: data.available,
        message: data.message
      })
    } catch {
      setUsernameStatus({ 
        checking: false, 
        available: false, 
        message: 'Error checking username' 
      })
    }
  }, [user?._id, user?.username])

  const handleUsernameChange = (value: string) => {
    const cleanUsername = value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')
    setFormData(prev => ({ ...prev, username: cleanUsername }))
    
    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current)
    }
    
    // Debounce username check
    usernameCheckTimeoutRef.current = setTimeout(() => {
      checkUsernameAvailability(cleanUsername)
    }, 500)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setProfileImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (usernameStatus.available === false) {
      toast.error('Please choose an available username')
      return
    }

    setIsUpdating(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append('username', formData.username.trim())
      submitFormData.append('name', formData.name.trim())
      submitFormData.append('bio', formData.bio.trim())
      submitFormData.append('userId', user?._id?.toString() || '')
      
      if (profileImage) {
        submitFormData.append('profileImage', profileImage)
      }

      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        body: submitFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      const { data: updatedUser } = await response.json()
      
      // Update the user in the session
      if (updateUser) {
        await updateUser({
          name: updatedUser.name,
          bio: updatedUser.bio,
          profileImageUrl: updatedUser.profileImageUrl
        })
      }
      
      toast.success('Profile updated successfully!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const getUsernameIcon = () => {
    if (usernameStatus.checking) return <Loader2 className="w-4 h-4 animate-spin" />
    if (usernameStatus.available === true) return <Check className="w-4 h-4 text-green-600" />
    if (usernameStatus.available === false) return <X className="w-4 h-4 text-red-600" />
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />
  }

  const getUsernameColor = () => {
    if (usernameStatus.available === true) return 'text-green-600'
    if (usernameStatus.available === false) return 'text-red-600'
    return 'text-muted-foreground'
  }

  const handleCopyAddress = async () => {
    if (!walletAddress) return
    
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopySuccess(true)
      toast.success("Wallet address copied to clipboard")
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      toast.error("Failed to copy address")
    }
  }

  const handleViewOnExplorer = () => {
    if (!walletAddress) return
    const explorerUrl = `https://basescan.org/address/${walletAddress}`
    window.open(explorerUrl, '_blank')
  }

  const handleDeleteAccount = async () => {
    if (!user?._id) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/delete?userId=${user._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      
      // Sign out and redirect to home
      setTimeout(() => {
        router.push('/')
        window.location.reload() // Force reload to clear all state
      }, 1000)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to access settings.
            </p>
            <Link href="/onboarding">
              <Button>Connect Wallet</Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Container className="py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2">
              Manage your account and application preferences
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Profile preview"
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    
                    <p className="text-sm text-muted-foreground text-center">
                      Upload a profile picture (optional)
                      <br />
                      Max 5MB • JPG, PNG, GIF
                    </p>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="Enter a unique username"
                        required
                        disabled={isUpdating}
                        className={cn(
                          "pr-10",
                          usernameStatus.available === false && "border-red-500",
                          usernameStatus.available === true && "border-green-500"
                        )}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getUsernameIcon()}
                      </div>
                    </div>
                    {usernameStatus.message && (
                      <p className={cn("text-xs", getUsernameColor())}>
                        {usernameStatus.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      3-30 characters • Letters, numbers, hyphens, and underscores only
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">
                      Display Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your display name"
                      required
                      disabled={isUpdating}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This name will be shown to customers making payments
                    </p>
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      disabled={isUpdating}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Connected via your wallet • Cannot be changed
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdating || !formData.username.trim() || !formData.name.trim() || usernameStatus.available === false}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating profile...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Wallet Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Address
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div>
                
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={walletAddress ? formatAddress(walletAddress) : "Not connected"}
                      disabled
                      className="bg-muted font-mono"
                    />
                    {walletAddress && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAddress}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewOnExplorer}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pl-2">
                    This is your wallet address
                  </p>
                </div>

              
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold">0</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Products Created</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold">$0.00</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Earnings</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold">0</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-sm sm:text-lg font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Member Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader className="pb-4">
                <CardTitle className="text-destructive text-lg">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm text-muted-foreground mb-4">
                  These actions cannot be undone. Please be careful.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will permanently delete your account and all associated data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                Are you absolutely sure you want to delete your account? This action cannot be undone.
                <br /><br />
                This will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your profile and personal information</li>
                  <li>All your products and payment links</li>
                  <li>Your payment history and analytics</li>
                  <li>All associated data</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}