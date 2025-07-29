"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Camera, Loader2, Upload, Check, X, AlertCircle } from "lucide-react"
import { toast } from "sonner"
// import { cn } from "@/lib/utils"
import type { User as UserType } from "@/types/user"

interface OnboardingFormProps {
  user: UserType
  onComplete: (updatedUser: UserType) => void
}

export function OnboardingForm({ user, onComplete }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: user.username || '',
    name: user.name || '',
    bio: user.bio || ''
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.profileImageUrl || null
  )
  
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

  // Generate initial username suggestion
  useEffect(() => {
    if (!formData.username && user.email) {
      const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')
      setFormData(prev => ({ ...prev, username: baseUsername }))
    }
  }, [user.email, formData.username])

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '' })
      return
    }

    if (username === user.username) {
      setUsernameStatus({ checking: false, available: true, message: 'Current username' })
      return
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking...' })

    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}&excludeUserId=${user._id}`)
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
  }, [user._id, user.username])

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append('username', formData.username.trim())
      submitFormData.append('name', formData.name.trim())
      submitFormData.append('bio', formData.bio.trim())
      submitFormData.append('userId', user._id?.toString() || '')
      
      if (profileImage) {
        submitFormData.append('profileImage', profileImage)
      }

      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        body: submitFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to complete onboarding')
      }

      const { data: updatedUser } = await response.json()
      toast.success('Profile setup completed!')
      onComplete(updatedUser)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
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

  return (
    <div className="py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Complete Your Profile
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
            Let&apos;s set up your profile to get started with crypto payments
          </p>
        </div>

        <Card 
          className="border-0 transition-all duration-300 hover:shadow-xl"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px'
          }}
        >
          <CardHeader className="p-6">
            <CardTitle className="flex items-center text-lg font-semibold" style={{ color: '#1f2937' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f8f8' }}>
                <User className="w-5 h-5" style={{ color: '#ff5941' }} />
              </div>
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isLoading}
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

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#374151' }}>
                  Display Name <span style={{ color: '#dc2626' }}>*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your display name"
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border transition-all duration-200"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#1f2937'
                  }}
                />
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  This is how your name will appear to customers
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
                  disabled={isLoading}
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

              {/* Email Display */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#374151' }}>
                  Email Address
                </Label>
                <Input
                  value={user.email}
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

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full text-white text-base px-6 py-3 h-auto rounded-xl font-medium transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
                disabled={isLoading || !formData.username.trim() || !formData.name.trim() || usernameStatus.available === false}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          You can update your profile information anytime in settings
        </p>
      </div>
    </div>
  )
} 