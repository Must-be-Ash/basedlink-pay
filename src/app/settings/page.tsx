"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
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
import { formatAddress } from "@/lib/utils"
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
  AlertCircle,
  Zap,
  BarChart3,
  Trash2
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
    if (usernameStatus.checking) return <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6b7280' }} />
    if (usernameStatus.available === true) return <Check className="w-4 h-4" style={{ color: '#16a34a' }} />
    if (usernameStatus.available === false) return <X className="w-4 h-4" style={{ color: '#dc2626' }} />
    return <AlertCircle className="w-4 h-4" style={{ color: '#6b7280' }} />
  }

  const getUsernameColor = () => {
    if (usernameStatus.available === true) return '#16a34a'
    if (usernameStatus.available === false) return '#dc2626'
    return '#6b7280'
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
      <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
        <Header />
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f8f8f8' }}>
              <Zap className="w-8 h-8" style={{ color: '#ff5941' }} />
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              Connect Your Wallet
            </h1>
            <p className="mb-6 leading-relaxed" style={{ color: '#6b7280' }}>
              You need to connect your wallet to access settings.
            </p>
            <Link href="/onboarding">
              <Button3D
                size="lg"
                className="text-white text-base px-8 py-3 h-auto rounded-xl font-medium"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
              >
                Connect Wallet
              </Button3D>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
      <Header />
      
      <Container className="py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Settings
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
            Manage your account and application preferences
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Profile Settings */}
          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f8f8' }}>
                  <User className="w-5 h-5" style={{ color: '#ff5941' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Profile Information</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed"
                      style={{ 
                        backgroundColor: imagePreview ? 'transparent' : '#f8f8f8',
                        borderColor: '#e5e7eb'
                      }}
                    >
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Profile preview"
                          width={96}
                          height={96}
                          className="object-cover rounded-full w-full h-full"
                        />
                      ) : (
                        <Camera className="w-8 h-8" style={{ color: '#6b7280' }} />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                        color: '#ffffff'
                      }}
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
                  
                  <p className="text-sm text-center" style={{ color: '#6b7280' }}>
                    Upload a profile picture (optional)
                    <br />
                    Max 5MB • JPG, PNG, GIF
                  </p>
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Username <span style={{ color: '#dc2626' }}>*</span>
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
                      className="pr-10 h-12 rounded-xl border transition-all duration-200"
                      style={{
                        backgroundColor: '#ffffff',
                        borderColor: usernameStatus.available === false ? '#dc2626' : 
                                    usernameStatus.available === true ? '#16a34a' : '#e5e7eb',
                        color: '#1f2937'
                      }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getUsernameIcon()}
                    </div>
                  </div>
                  {usernameStatus.message && (
                    <p className="text-xs" style={{ color: getUsernameColor() }}>
                      {usernameStatus.message}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    3-30 characters • Letters, numbers, hyphens, and underscores only
                  </p>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Display Name <span style={{ color: '#dc2626' }}>*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your display name"
                    required
                    disabled={isUpdating}
                    className="h-12 rounded-xl border transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      color: '#1f2937'
                    }}
                  />
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    This name will be shown to customers making payments
                  </p>
                </div>

                {/* Bio Field */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Bio (Optional)
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    disabled={isUpdating}
                    maxLength={500}
                    className="rounded-xl border transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      color: '#1f2937'
                    }}
                  />
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="h-12 rounded-xl border"
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderColor: '#e5e7eb',
                      color: '#6b7280'
                    }}
                  />
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Connected via your wallet • Cannot be changed
                  </p>
                </div>

                <Button3D
                  type="submit" 
                  disabled={isUpdating || !formData.username.trim() || !formData.name.trim() || usernameStatus.available === false}
                  className="text-white text-base px-6 py-3 h-auto rounded-xl font-medium w-full transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                  }}
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
                </Button3D>
              </form>
            </div>
          </Card>

          {/* Wallet Information */}
          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f8f8' }}>
                  <Wallet className="w-5 h-5" style={{ color: '#ff5941' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Wallet Address</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={walletAddress ? formatAddress(walletAddress) : "Not connected"}
                      disabled
                      className="h-12 rounded-xl border font-mono flex-1"
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderColor: '#e5e7eb',
                        color: '#1f2937'
                      }}
                    />
                    {walletAddress && (
                      <>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={handleCopyAddress}
                          className="h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                          style={{ 
                            backgroundColor: '#f8f9fa',
                            borderColor: '#e5e7eb',
                            color: '#374151'
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={handleViewOnExplorer}
                          className="h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                          style={{ 
                            backgroundColor: '#f8f9fa',
                            borderColor: '#e5e7eb',
                            color: '#374151'
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                    This is your wallet address for receiving payments
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Statistics */}
          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f8f8' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: '#ff5941' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Account Statistics</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="text-center p-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>0</div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>Products Created</div>
                </div>
                <div 
                  className="text-center p-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>$0.00</div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>Total Earnings</div>
                </div>
                <div 
                  className="text-center p-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>0</div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>Total Sales</div>
                </div>
                <div 
                  className="text-center p-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="text-lg font-bold mb-1" style={{ color: '#1f2937' }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>Member Since</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px',
              borderLeft: '4px solid #dc2626'
            }}
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#fef2f2' }}>
                  <Trash2 className="w-5 h-5" style={{ color: '#dc2626' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#dc2626' }}>Danger Zone</h3>
              </div>

              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
                These actions cannot be undone. Please be careful.
              </p>
              
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: '#fef2f2',
                    borderColor: '#dc2626',
                    color: '#dc2626'
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  This will permanently delete your account and all associated data.
                </p>
              </div>
            </div>
          </Card>
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