import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CDPProvider } from '@/components/CDPProvider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crypto Stripe Link - Accept Crypto Payments',
  description: 'Create products and accept crypto payments with shareable links',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CDPProvider>
          {children}
          <Toaster position="bottom-right" />
        </CDPProvider>
      </body>
    </html>
  )
}
