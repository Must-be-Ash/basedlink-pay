"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentStatus } from "@/components/PaymentStatus"
import { EmptyState } from "@/components/EmptyState"
import { Loading, PageLoading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { formatCurrency } from "@/lib/utils"
import { 
  Search, 
  Download, 
  DollarSign,
  ArrowLeft,
  Zap,
  CheckCircle,
  Clock
} from "lucide-react"
import Link from "next/link"
import type { PaymentWithProduct } from "@/types/payment"

export default function PaymentsPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const { isAuthenticated, user, isLoading: userLoading } = useUserSession()
  const [payments, setPayments] = useState<PaymentWithProduct[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all")

  const fetchPayments = React.useCallback(async () => {
    if (!user?._id) return

    try {
      setIsLoading(true)
      const url = productId 
        ? `/api/payments?productId=${productId}`
        : `/api/payments?sellerId=${user._id}`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const { data } = await response.json()
        setPayments(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, productId])

  const filterPayments = React.useCallback(() => {
    let filtered = payments

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }, [payments, searchQuery, statusFilter])

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchPayments()
    }
  }, [isAuthenticated, user, productId, fetchPayments])

  useEffect(() => {
    filterPayments()
  }, [payments, searchQuery, statusFilter, filterPayments])

  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountUSD, 0)

  const completedPayments = payments.filter(p => p.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length

  if (userLoading) {
    return (
      <PageLoading text="Loading..." />
    )
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
              You need to connect your wallet to view payments.
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
      
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            {productId ? (
              <div className="flex items-center space-x-6">
                <Link href="/products">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                    Product Payments
                  </h1>
                  <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
                    Payment history for this product
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  Payments
                </h1>
                <p className="text-lg leading-relaxed" style={{ color: '#6b7280' }}>
                  Track all your payment transactions
                </p>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline"
            className="h-12 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: '#f8f9fa',
              borderColor: '#e5e7eb',
              color: '#374151'
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  <DollarSign className="w-6 h-6" style={{ color: '#ff5941' }} />
                </div>
                <Badge 
                  variant="outline"
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: '#C4C4C4',
                    color: '#696969'
                  }}
                >
                  {completedPayments} payments
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Total Earnings
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: '#ff5941' }} />
                </div>
                <Badge 
                  variant="outline"
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: '#C4C4C4',
                    color: '#696969'
                  }}
                >
                  Completed
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                {completedPayments}
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Successful Payments
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  <Clock className="w-6 h-6" style={{ color: '#ff5941' }} />
                </div>
                <Badge 
                  variant="outline"
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: '#C4C4C4',
                    color: '#696969'
                  }}
                >
                  Pending
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
                {pendingPayments}
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Awaiting Confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card 
          className="border-0 mb-8"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px'
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
                <Input
                  placeholder="Search by email, transaction hash, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-0 text-base"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "all" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("completed")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "completed" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  Completed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "pending" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  Pending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("failed")}
                  className="h-12 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  style={statusFilter === "failed" ? { 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
                    border: 'none',
                    color: '#ffffff'
                  } : { 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                >
                  Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" text="Loading payments..." />
          </div>
        ) : filteredPayments.length === 0 ? (
          <Card 
            className="border-0"
            style={{ 
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px'
            }}
          >
            <CardContent className="py-16">
              <EmptyState
                icon={DollarSign}
                title={payments.length === 0 ? "No payments yet" : "No payments found"}
                description={
                  payments.length === 0 
                    ? "Your payment transactions will appear here once customers start purchasing your products"
                    : "Try adjusting your search or filter criteria"
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <PaymentStatus
                key={payment._id?.toString()}
                payment={payment}
                showDetails={true}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}