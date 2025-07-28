"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/Header"
import { Container } from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentStatus } from "@/components/PaymentStatus"
import { EmptyState } from "@/components/EmptyState"
import { Loading } from "@/components/Loading"
import { useUserSession } from "@/hooks/useUserSession"
import { formatCurrency } from "@/lib/utils"
import { 
  Search, 
  Download, 
  DollarSign,
  ArrowLeft,
  Calendar
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
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <Loading size="lg" text="Loading..." />
        </Container>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to view payments.
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
      
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {productId ? (
              <div className="flex items-center space-x-4">
                <Link href="/products">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">Product Payments</h1>
                  <p className="text-muted-foreground">
                    Payment history for this product
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold">Payments</h1>
                <p className="text-muted-foreground">
                  Track all your payment transactions
                </p>
              </div>
            )}
          </div>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                From {completedPayments} completed payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedPayments}</div>
              <p className="text-xs text-muted-foreground">Successful payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by email, transaction hash, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("failed")}
            >
              Failed
            </Button>
          </div>
        </div>

        {/* Payments List */}
        {isLoading ? (
          <Loading size="lg" text="Loading payments..." />
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title={payments.length === 0 ? "No payments yet" : "No payments found"}
            description={
              payments.length === 0 
                ? "Your payment transactions will appear here once customers start purchasing your products"
                : "Try adjusting your search or filter criteria"
            }
          />
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