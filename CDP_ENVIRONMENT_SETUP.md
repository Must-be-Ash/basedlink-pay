# CDP Environment Setup

## Quick Fix for Session Token Issue

If you're getting "Invalid sessionToken" errors, you need to set up your CDP API credentials properly.

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# CDP Project Configuration
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id_here

# CDP API Authentication (Required for Session Tokens)
CDP_API_KEY_NAME=organizations/{org_id}/apiKeys/{key_id}
CDP_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxx
-----END EC PRIVATE KEY-----"

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/crypto-stripe-link

# NextAuth
NEXTAUTH_SECRET=your_32_character_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### How to Get CDP Credentials

1. **Visit CDP Portal**: Go to [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)

2. **Create/Select Project**: Create a new project or select existing one

3. **Get Project ID**: Copy your project ID for `NEXT_PUBLIC_CDP_PROJECT_ID`

4. **Create API Key**:
   - Go to **API Keys** tab
   - Click **Create API key**
   - Select **Secret API key** (required for session tokens)
   - Download the JSON file

5. **Extract Credentials**:
   - `CDP_API_KEY_NAME`: The "name" field from JSON (format: `organizations/{org_id}/apiKeys/{key_id}`)
   - `CDP_PRIVATE_KEY`: The "privateKey" field from JSON (starts with `-----BEGIN EC PRIVATE KEY-----`)

### Important Notes

- **Private Key Format**: Must include the `-----BEGIN` and `-----END` lines
- **Newlines**: Keep the private key exactly as downloaded (with actual newlines)
- **Security**: Never commit `.env.local` to version control
- **Development**: The app will use mock tokens if CDP SDK is unavailable in development

### Testing

After setting up the environment variables:

1. Restart your development server: `npm run dev`
2. Try the "Add USDC with Coinbase" button
3. Should now generate valid session tokens

### Troubleshooting

**Still getting errors?**
- Check that your API key has the correct permissions
- Verify the private key format (no extra spaces/characters)
- Ensure you're using a **Secret API key**, not a Client API key
- Check the console for detailed error messages in development mode

## Network Configuration

- **Blockchain**: Base mainnet (chainId: 8453)
- **USDC Contract**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **RPC URL**: `https://mainnet.base.org`

## Guest Checkout Limits

- **Weekly Limit**: $500 USD
- **Minimum**: $5 USD
- **Payment Methods**: Debit card, Apple Pay
- **Supported**: US residents only

## Security Best Practices

1. **Environment Variables**: Store all sensitive data in `.env.local`
2. **API Keys**: Rotate keys regularly
3. **IP Allowlist**: Configure IP restrictions in CDP Portal
4. **Monitoring**: Monitor API usage and errors

## Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Use production CDP credentials
3. Configure proper domain in CDP Portal
4. Test thoroughly before going live 