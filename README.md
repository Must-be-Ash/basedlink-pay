# 🌍 StableLink - The Payment Platform Template That Works Everywhere

**The complete foundation for building payment-powered apps.** No crypto knowledge required.

A full-featured product creation and payment platform built with CDP Embedded Wallets. Your users just enter their email and pay - they'll never know it's crypto. Fork this template to build your own Gumroad, Buy Me a Coffee, Patreon, or any payment-powered business for your specific niche.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-stablelink.xyz-blue?style=for-the-badge)](https://www.stablelink.xyz)
[![Fork Template](https://img.shields.io/badge/🍴_Fork_Template-GitHub-black?style=for-the-badge)](https://github.com/Must-be-Ash/basedlink-pay)
[![Get CDP Keys](https://img.shields.io/badge/🔑_Get_CDP_Keys-Free-orange?style=for-the-badge)](https://portal.cdp.coinbase.com/)

> **🎯 The CDP Advantage**: Users authenticate with email, no seed phrases. Payments feel like PayPal/Venmo but work globally without restrictions. This is what "Web3 that feels like Web2" actually looks like.

---

## 🔥 Fork This → Build Your Niche Business

**This template isn't just a demo - it's your launchpad to build payment-powered businesses:**

### ⚡ **10-Minute Customization**
1. Fork this repo 
2. Change branding, colors, and copy in config files
3. Deploy to Vercel with one click
4. Get your CDP API keys (free)
5. **You now have a business accepting global payments**

### 🌍 **Why This Works Globally**
- **No Stripe geo-restrictions**: Users from Nigeria, India, Philippines can pay you instantly
- **No PayPal account requirements**: Anyone with email can become your customer  
- **No bank account needed**: Both you and your users bypass traditional banking entirely
- **Instant settlement**: Get paid in 90 seconds, not 7-14 days

### 🎯 **The Fork Strategy**
Each fork creates a specialized payment platform:
- **Fitness coaches**: Sell workout plans and consultations
- **Coding mentors**: Monetize tutorials and code reviews  
- **Digital artists**: Sell artwork with global reach
- **Consultants**: Accept payments from international clients

> **💡 Pro Tip**: The businesses thriving with this template aren't crypto companies - they're normal businesses that happen to use better payment infrastructure.

---

## 🚀 What You Can Build With This Template

*This isn't just a demo - it's a complete foundation you can fork and customize for any payment-powered business:*

### 💰 **Creator Monetization Platforms**
- **Digital Art Sales**: Sell artwork, photography, NFTs with instant settlement
- **Course Platforms**: Educational content with global payment access
- **Creator Tips**: Fan funding for YouTube, blogs, podcasts  
- **Music/Beats Marketplace**: Producer marketplace with instant royalties

### 🌍 **Global Service Businesses**
- **Freelance Payments**: Accept payments from anywhere without restrictions
- **Consultation Booking**: Paid sessions (like Intro.co or Clarity.fm) 
- **Time-Based Services**: Coaching, tutoring, expert Q&A
- **Event Ticketing**: Global ticket sales with NFT proof-of-attendance

### 🛍️ **E-commerce & Marketplaces**
- **Digital Products**: Software, templates, design assets
- **Subscription Services**: Premium content with recurring payments
- **Niche Marketplaces**: Specialized platforms for specific communities
- **Crowdfunding**: Raise funds globally without geographic restrictions

### 🔧 **Developer-Focused Use Cases**
- **Headless Payment API**: Embed payment buttons in existing sites
- **Component Libraries**: Sell React/Vue components with instant delivery
- **SaaS Billing**: Usage-based billing for developer tools
- **Open Source Funding**: Sponsor buttons for GitHub projects

> **⚡ The Template Advantage**: Complete user auth, product management, payment processing, and dashboard - all production-ready. Fork, customize for your niche, deploy in 30 minutes.

---

## ✨ Why This Template Showcases CDP Perfectly

### 🎯 **"Invisible Web3" Experience**
- **Email Authentication**: Users just enter email + OTP - no seed phrases or MetaMask
- **Feels Like Web2**: Payment flow identical to PayPal/Stripe - users never know it's crypto
- **Mobile-First**: Works flawlessly on all devices without browser extensions
- **Instant Onboarding**: From landing page to first payment in under 2 minutes

```typescript
// The magic: Web3 payments that feel like Web2
<PaymentButton 
  amount={29.99}
  description="Premium Course Access"
  onSuccess={() => grantAccess()}
/>
// User experience: Enter email → Pay → Done
```

### 🌍 **Global by Design**
- **No Restrictions**: Works in every country CDP operates (100+ countries)
- **Instant Settlement**: Payments confirmed in ~90 seconds, not days
- **Penny-Level Fees**: Base network transactions cost cents, not percentages
- **No Financial Gatekeeping**: No bank account or credit card required

### 🏗️ **Production-Ready Template**
- **Complete Platform**: User management, product creation, payments, dashboard
- **Enterprise Security**: Built-in compliance, policies, and fraud protection
- **Scalable Architecture**: Next.js 14, TypeScript, MongoDB - handles millions of users
- **Fork-Ready**: Customize branding, copy, and features for any niche in minutes

---

## 🎯 Perfect For These Developers

### 👨‍💻 **Web2 Developers New to Crypto** 
*"I want to build with crypto but all the wallets/complexity scares me"*

**This template shows you**: How crypto payments can be as simple as Stripe integration. Users never see the blockchain - they just pay with email.

### 🌍 **Builders Facing Payment Restrictions**
*"Stripe/PayPal doesn't work in my country or blocks my users"*  

**This template shows you**: How to accept payments from anywhere in the world instantly, with lower fees than traditional processors.

### 💡 **Entrepreneurs with Specific Niches** 
*"I want to build a Gumroad for X or Buy Me a Coffee for Y"*

**This template shows you**: Complete foundation you can customize for any vertical - fitness coaches, coding mentors, artists, consultants.

### 🏢 **Agency/Freelance Developers**
*"Clients want global payment capabilities that 'just work'"*

---

## 🚀 Quick Start (5 Minutes)

### 1. **Get Your CDP API Keys** 
👉 **[Generate API Keys at CDP Portal](https://portal.cdp.coinbase.com/)**

### 2. **Fork & Clone**
```bash
git clone https://github.com/Must-be-Ash/basedlink-pay
cd basedlink-pay
npm install
```

### 3. **Configure Environment** 
```bash
# Copy example environment file
cp .env.example .env.local

# Fill in your actual values in .env.local
```

**Required Environment Variables:**
- **CDP Project ID**: Get from [CDP Portal Projects](https://portal.cdp.coinbase.com/projects)
- **CDP API Credentials**: Get from [CDP API Access](https://portal.cdp.coinbase.com/access/api)
- **MongoDB URI**: Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
- **Vercel Blob Token**: Get from [Vercel Dashboard](https://vercel.com/dashboard/stores)
- **Alchemy API Key**: Get from [Alchemy Dashboard](https://dashboard.alchemy.com/)

### 4. **Configure Your Domain**
🌐 **[Add Your Domain](https://portal.cdp.coinbase.com/products/embedded-wallets)** to Embedded Wallets allowlist

💳 **[Add Domain to Onramp](https://portal.cdp.coinbase.com/products/onramp)** for seamless balance top-ups

### 5. **Launch**
```bash
npm run dev
# Visit http://localhost:3000 🎉
```

---

## 🛠️ Customization Ideas

### 🎨 **Branding & UI**
- Change colors, fonts, and logo in `tailwind.config.js`
- Customize components in `/src/components/ui/`  
- Add your own hero section and messaging

### 💰 **Business Logic**
- Modify pricing models in `/src/lib/models/product.ts`
- Add subscription tiers, discounts, bulk pricing
- Integrate with your existing user system

### 🔌 **Integrations** 
- Connect to your CRM/email system
- Add analytics (Google, Mixpanel, etc.)
- Integrate with shipping providers
- Connect to inventory management

### 🌍 **Localization**
- Add multi-language support
- Regional pricing and currencies
- Local payment methods

---

## 🏗️ Architecture Overview

### **Frontend** (Next.js 14)
- **App Router** with TypeScript for type safety
- **Tailwind CSS** for utility-first styling  
- **CDP React Hooks** for wallet integration
- **Responsive Design** that works on all devices

### **Backend** (API Routes)
- **RESTful APIs** with input validation
- **Blockchain Verification** via Alchemy
- **Authentication System** with dual-factor security
- **Database Models** with proper relationships

### **Database** (MongoDB)
- **Optimized Schemas** for users, products, payments
- **Proper Indexing** for fast queries
- **Relationship Management** with referential integrity

### **Security** (Enterprise-Grade)
- **Authentication Middleware** on all protected routes
- **Ownership Verification** prevents unauthorized access
- **Transaction Verification** validates all blockchain payments
- **Input Sanitization** prevents injection attacks

---

## 🔧 Configuration

### **Environment Variables**

**🔑 Get Your CDP API Keys First!**
Before setting up the project, you'll need CDP API credentials. **[Sign up at CDP Portal](https://portal.cdp.coinbase.com/)** to get your free API keys.

```bash
# ==============================================================================
# REQUIRED - CDP (Coinbase Developer Platform) Configuration
# ==============================================================================
# Get your CDP Project ID from: https://portal.cdp.coinbase.com/projects
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id_here

# Get your CDP API credentials from: https://portal.cdp.coinbase.com/access/api
# These are REQUIRED for onramp functionality (buying USDC)
CDP_API_KEY_NAME=your_cdp_api_key_name_here
CDP_PRIVATE_KEY=your_cdp_private_key_here

# ==============================================================================
# REQUIRED - Database & Storage
# ==============================================================================
# MongoDB connection string - create a free cluster at: https://cloud.mongodb.com/
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Vercel Blob storage token for image uploads - get from: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Alchemy API key for blockchain verification - get from: https://dashboard.alchemy.com/
ALCHEMY_API_KEY=your_alchemy_api_key_here

# ==============================================================================
# OPTIONAL - Application Configuration
# ==============================================================================
# Base URL for your application (update for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# API key for internal server-to-server requests (generate a random string)
API_KEY=your_random_api_key_here
```

**📄 Complete Configuration:**
Copy `.env.example` to `.env.local` and fill in your actual values. The example file includes all required and optional environment variables with documentation.

### **Database Setup**
```bash
# Create MongoDB indexes for optimal performance
npm run db:indexes
```

### **Custom Domains**
1. Deploy to Vercel/Netlify/Railway
2. Add custom domain in platform settings
3. Update `NEXT_PUBLIC_BASE_URL` environment variable
4. Add domain to CDP allowlists (links above)

---

## 🚀 One-Click Deployment

### **Vercel** (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Must-be-Ash/basedlink-pay)

Deploy your StableLink fork to Vercel in 30 seconds. Perfect for rapid prototyping and production deployments.

---

## 🤝 Community & Support

### **Get Help**
- 📖 **[CDP Documentation](https://docs.cdp.coinbase.com/)** - Complete CDP setup guides
- 💬 **[CDP Discord](https://discord.com/invite/cdp)** - Get help from the CDP community  
- 🐛 **[GitHub Repo](https://github.com/Must-be-Ash/basedlink-pay)** - View source code and fork
- 🐦 **[Contact Builder](https://x.com/Must_be_Ash)** - Reach out to the creator directly

### **Follow CDP**
- 🐦 **[CDP Twitter](https://x.com/coinbasedev)** - Latest updates and announcements
- 💼 **[CDP LinkedIn](https://www.linkedin.com/company/coinbasedeveloperplatform/)** - Professional updates and insights

### **Contributing**
- 🍴 **Fork the repo** and create your feature branch
- 🧪 **Add tests** for new functionality  
- 📝 **Update documentation** as needed
- 🚀 **Submit a pull request** with detailed description

### **Show Your Build**
Built something cool with this foundation? **[Share it with the builder!](https://x.com/Must_be_Ash)** Tag @Must_be_Ash to show off your creation.

---

## 📊 What You Get Out of the Box

### ✅ **Complete User Management**
- Email-based wallet creation (no seed phrases!)
- User profiles and onboarding
- Session management and authentication

### ✅ **Product Management System**  
- Create/edit/delete products
- Image uploads and descriptions
- Pricing in USD (auto-converts to USDC)
- Product sharing and analytics

### ✅ **Payment Processing**
- Blockchain-verified transactions
- Real-time payment status
- Transaction history and receipts
- Failed payment handling

### ✅ **Business Dashboard**
- Revenue analytics and reporting
- Product performance metrics
- User engagement tracking
- Export capabilities

### ✅ **Mobile Experience**
- Progressive Web App (PWA) ready
- QR code payments for in-person sales
- Touch-friendly interface
- Offline-capable architecture

---

## 💡 The CDP Embedded Wallets Difference

*This template showcases what makes CDP special - payments that feel like Web2 but work like Web3:*

### **🎯 For Your Users (They'll Never Know It's Crypto)**
- **Email Login**: No MetaMask, no seed phrases - just email + OTP like any modern app
- **Familiar Flow**: Payment experience identical to Stripe/PayPal checkout
- **Works Everywhere**: Any device, any browser, mobile-first design
- **Instant Balance Top-ups**: Seamless onramp integration when users need more funds
- **Global**: Accept payments from users traditional processors can't serve

### **⚡ For You (The Developer)**
- **React Components**: Pre-built hooks and components - no blockchain knowledge needed
- **5-Minute Integration**: Add the PaymentButton component and you're done
- **Production Scale**: Built on Coinbase infrastructure that handles millions of transactions
- **Zero Maintenance**: No wallet compatibility issues, browser extension dependencies, or user support for "lost seed phrases"
- **Compliance Included**: KYC/AML, fraud detection, and policy controls built-in

```typescript
// This is all you need - CDP handles the complexity
import { PaymentButton } from './components/PaymentButton'

<PaymentButton 
  amount={9.99}
  description="Premium Course" 
  onSuccess={(txHash) => grantAccess()}
/>
```

---

## 🚀 Ready to Build with CDP?

**The magic isn't the crypto - it's making crypto invisible.**

Every fork of this template creates new opportunities for global payments. Every customization proves that Web3 can feel like Web2. Every deployment shows the world what inclusive finance looks like.

### **⚡ Your Next Steps**

1. **[🔑 Get Your Free CDP API Keys](https://portal.cdp.coinbase.com/)** - Start building in 30 seconds
2. **[🍴 Fork This Template](https://github.com/Must-be-Ash/basedlink-pay)** - Your foundation is ready
3. **[🌐 Configure Your Domains](https://portal.cdp.coinbase.com/products/embedded-wallets)** - Enable your users
4. **[💳 Add Onramp Domain](https://portal.cdp.coinbase.com/products/onramp)** - Seamless balance top-ups
5. **🚀 Ship Your Niche Platform** - You're now accepting payments from anywhere

### **🎯 Success Metrics We're Tracking**
- **Developer Signups**: How many get CDP API keys after seeing this
- **Template Forks**: How many customize this for their specific use case  
- **Live Deployments**: How many actually ship payment-powered businesses
- **Global Reach**: How many countries your users are paying from

---

**💬 Share Your Build**
Built something cool with this template? **[Tag @Must_be_Ash](https://x.com/Must_be_Ash)** and **[@CoinbaseDev](https://x.com/coinbasedev)** - we love seeing what you create!

**🔗 Essential Links**
[CDP Portal](https://portal.cdp.coinbase.com/) • [Live Demo](https://www.stablelink.xyz) • [Fork Template](https://github.com/Must-be-Ash/basedlink-pay) • [CDP Docs](https://docs.cdp.coinbase.com/)

---

*This template showcases [CDP Embedded Wallets](https://www.coinbase.com/developer-platform) - the easiest way to add crypto payments that feel like Web2.*