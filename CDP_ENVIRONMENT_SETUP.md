# CDP Onramp Environment Setup

This document outlines the required environment variables for Coinbase Developer Platform (CDP) Onramp integration.

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Coinbase Developer Platform Configuration
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id_here
CDP_API_KEY_NAME=your_api_key_name  
CDP_PRIVATE_KEY=your_private_key_here

# MongoDB Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/crypto-stripe-link

# NextAuth Configuration
NEXTAUTH_SECRET=your_32_character_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## How to Get CDP Credentials

1. **Sign up for Coinbase Developer Platform:**
   - Visit [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)
   - Create an account and verify your identity

2. **Create a New Project:**
   - Navigate to the dashboard
   - Click "Create Project"
   - Select "Onramp" as the product

3. **Generate API Credentials:**
   - Go to project settings
   - Generate a new API key
   - Save the `API Key Name` and `Private Key` securely
   - Copy the `Project ID` from the project overview

4. **Configure Project Settings:**
   - Add your domain(s) to the allowed origins
   - For development: `http://localhost:3000`
   - For production: `https://your-domain.com`

## Network Configuration

- **Primary Network:** Base (Chain ID: 8453)
- **USDC Contract:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Supported Assets:** USDC (primary), ETH (secondary)
- **Transaction Type:** EIP-1559

## Guest Checkout Limits

- **Minimum Amount:** $5 USD
- **Weekly Limit:** $500 USD
- **Supported Payment Methods:** Card, Apple Pay
- **Supported Countries:** US (initially)

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never expose private keys client-side**
2. **Keep API credentials in server environment only**
3. **Use JWT tokens for secure session management**
4. **Validate all session tokens server-side**
5. **Implement proper CORS configuration**

## Testing

To test the onramp integration:

1. Ensure all environment variables are set
2. Start the development server: `npm run dev`
3. Navigate to a product payment page
4. Try making a payment with insufficient USDC balance
5. The funding UI should appear with onramp options

## Production Deployment

Before deploying to production:

1. Update environment variables in your hosting provider
2. Configure proper domain CORS settings in CDP portal
3. Test the complete payment and funding flow
4. Monitor transaction success rates and user experience 