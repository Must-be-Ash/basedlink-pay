import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongodb'],
  images: {
    domains: ['localhost', 'basedlink.xyz'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  webpack: (config) => {
    // Exclude MongoDB from client-side bundle
    config.externals = config.externals || []
    config.externals.push({
      'mongodb': 'commonjs mongodb',
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
    })
    
    // Ignore Node.js modules that don't work in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      'fs/promises': false,
    }
    
    return config
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  
  // CORS configuration
  async rewrites() {
    return []
  },
};

export default nextConfig;
