"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserSession } from "@/hooks/useUserSession"
import { formatAddress } from "@/lib/utils"
import { 
  User, 
  Wallet, 
  Bell, 
  Shield, 
  Save,
  Copy,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SettingsPage() {
  const { isAuthenticated, user, walletAddress, updateUser } = useUserSession()
  const [name, setName] = useState(user?.name || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [, setCopySuccess] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      setIsUpdating(true)
      await updateUser({ name: name.trim() })
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
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
            <Link href="/test-wallet">
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
      
      <Container className="py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start bg-muted">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      disabled={isUpdating}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This name will be shown to customers making payments
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
                      Email address cannot be changed
                    </p>
                  </div>

                  <Button type="submit" disabled={isUpdating || !name.trim()}>
                    {isUpdating ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
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
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Wallet Address</Label>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    This is your Coinbase embedded wallet address on Base network
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Wallet Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatically created when you sign in</li>
                    <li>• Secured by Coinbase infrastructure</li>
                    <li>• Supports Base network (USDC payments)</li>
                    <li>• No seed phrase required</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Products Created</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">$0.00</div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Member Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions cannot be undone. Please be careful.
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" disabled>
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Account deletion is not available in beta
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}