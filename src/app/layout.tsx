import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CDPProvider } from '@/components/CDPProvider'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: "#ff5941",
}

export const metadata: Metadata = {
  title: "Crypto Stripe Link - List your product, share your link, get paid",
  description: "Get paid for your products and services without platform fees",
  keywords: [
    "crypto payments",
    "USDC",
    "Base blockchain",
    "payment links",
    "cryptocurrency",
    "digital payments",
    "crypto commerce",
    "blockchain payments",
    "Coinbase Commerce",
    "Web3 payments"
  ],
  authors: [{ name: "Crypto Stripe Link Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/logo.png' },
    ],
    other: [
      { 
        rel: 'android-chrome',
        url: '/android-chrome-192x192.png',
        sizes: '192x192'
      },
      { 
        rel: 'android-chrome',
        url: '/android-chrome-512x512.png',
        sizes: '512x512'
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Crypto Stripe Link - List your product, share your link, get paid",
    description: "Get paid for your products and services without platform fees",
    url: "https://stablelink.xyz",
    siteName: "Crypto Stripe Link",
    type: "website",
    images: [
      {
        url: "https://stablelink.xyz/og.png",
        width: 1200,
        height: 630,
        alt: "Crypto Stripe Link - Accept Crypto Payments with Shareable Links",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Stripe Link - List your product, share your link, get paid",
    description: "Get paid for your products and services without platform fees",
    images: ["https://stablelink.xyz/og.png"],
  },
  metadataBase: new URL("https://stablelink.xyz"),
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
          <Analytics />
        </CDPProvider>
      </body>
    </html>
  )
}
