# 🌍 StableLink - Payment Platform Template

**Complete foundation for building payment-powered apps.** No crypto knowledge required.

A full-featured product creation and payment platform built with CDP Embedded Wallets. Your users just enter their email and pay - they'll never know it's crypto. Fork this template to build your own Gumroad, Buy Me a Coffee, Patreon, or any payment-powered business.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-stablelink.xyz-blue?style=for-the-badge)](https://www.stablelink.xyz )
[![Fork Template](https://img.shields.io/badge/🍴_Fork_Template-GitHub-black?style=for-the-badge)](https://github.com/Must-be-Ash/basedlink-pay)
[![Get CDP Keys](https://img.shields.io/badge/🔑_Get_CDP_Keys-Free-orange?style=for-the-badge)](https://portal.cdp.coinbase.com/)

> **🎯 The CDP Advantage**: Users authenticate with email, no seed phrases. Payments feel like PayPal/Venmo but work globally without restrictions.

---


## 🚀 Quick Start

### 1. **Get CDP API Keys** 
👉 **[Generate API Keys](https://portal.cdp.coinbase.com/)**

### 2. **Fork & Clone**
```bash
git clone https://github.com/Must-be-Ash/basedlink-pay
cd basedlink-pay
npm install
```

### 3. **Configure Environment** 
```bash
cp .env.example .env.local
# Fill in your actual values in .env.local
```

**Required Variables:**
- **CDP Project ID**: [CDP Portal Projects](https://portal.cdp.coinbase.com/projects)
- **CDP API Credentials**: [CDP API Access](https://portal.cdp.coinbase.com/access/api)
- **MongoDB URI**: [MongoDB Atlas](https://cloud.mongodb.com/)
- **Vercel Blob Token**: [Vercel Dashboard](https://vercel.com/dashboard/stores)
- **Alchemy API Key**: [Alchemy Dashboard](https://dashboard.alchemy.com/)

### 4. **Configure Domains**
- **[Add Domain to Embedded Wallets](https://portal.cdp.coinbase.com/products/embedded-wallets)**
- **[Add Domain to Onramp](https://portal.cdp.coinbase.com/products/onramp)**

### 5. **Launch**
```bash
npm run dev
# Visit http://localhost:3000 🎉
```

---


## 🚀 What You Can Build

### 💰 **Creator Platforms**
- Digital art sales with instant settlement
- Course platforms with global payment access
- Creator tips for YouTube, blogs, podcasts  
- Music/beats marketplace with instant royalties

### 🌍 **Service Businesses**
- Freelance payments without restrictions
- Consultation booking (like Intro.co or Clarity.fm) 
- Coaching, tutoring, expert Q&A
- Event ticketing with NFT proof-of-attendance

### 🛍️ **E-commerce**
- Digital products: software, templates, design assets
- Subscription services with recurring payments
- Niche marketplaces for specific communities
- Crowdfunding without geographic restrictions

### 🔧 **Developer Tools**
- Headless payment API for existing sites
- Component libraries with instant delivery
- SaaS billing for developer tools
- Open source funding buttons

---

## 🎯 Key Features

### **"Invisible Web3" Experience**
- **Email Authentication**: No seed phrases or MetaMask
- **Familiar Flow**: Identical to PayPal/Stripe checkout
- **Mobile-First**: Works on all devices without extensions
- **Instant Onboarding**: Landing page to first payment in under 2 minutes

```typescript
// The magic: Web3 payments that feel like Web2
<PaymentButton 
  amount={29.99}
  description="Premium Course Access"
  onSuccess={() => grantAccess()}
/>
// User experience: Enter email → Pay → Done
```

### **Global by Design**
- **No Restrictions**: Works in 100+ countries
- **Instant Settlement**: Payments confirmed in ~90 seconds
- **Low Fees**: Blockchain transactions cost cents, not percentages
- **No Banking Required**: Users don't need bank accounts or credit cards

### **Production-Ready**
- **Complete Platform**: User management, product creation, payments, dashboard
- **Enterprise Security**: Built-in compliance, policies, fraud protection
- **Scalable Architecture**: Next.js 14, TypeScript, MongoDB
- **Fork-Ready**: Customize branding and features in minutes

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, CDP React Hooks
**Backend:** API Routes, Alchemy blockchain verification, authentication
**Database:** MongoDB with optimized schemas and indexing
**Security:** Authentication middleware, transaction verification, input sanitization

---

## 🔧 Environment Configuration

```bash
# CDP Configuration
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id
CDP_API_KEY_NAME=your_cdp_api_key_name
CDP_PRIVATE_KEY=your_cdp_private_key

# Database & Storage
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
ALCHEMY_API_KEY=your_alchemy_api_key

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
API_KEY=your_random_api_key
```

---

## 📊 What's Included

- ✅ **Email-based wallet creation** (no seed phrases)
- ✅ **Product management system** with image uploads
- ✅ **Blockchain-verified payments** with real-time status
- ✅ **Business dashboard** with analytics and reporting
- ✅ **Mobile PWA** with QR code payments
- ✅ **Global payment processing** in 100+ countries

---

## 🚀 Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Must-be-Ash/basedlink-pay)

---

## 🤝 Support & Community

- 📖 **[CDP Documentation](https://docs.cdp.coinbase.com/)**
- 💬 **[CDP Discord](https://discord.com/invite/cdp)**
- 🐛 **[GitHub Repo](https://github.com/Must-be-Ash/basedlink-pay)**
- 🐦 **[Contact Builder](https://x.com/Must_be_Ash)**



**🔗 Quick Links**
[CDP Portal](https://portal.cdp.coinbase.com/) • [Live Demo](https://www.stablelink.xyz) • [Fork Template](https://github.com/Must-be-Ash/basedlink-pay) • [CDP Docs](https://docs.cdp.coinbase.com/)

---

**Made by [@must_be_ash] (https://x.com/Must_be_Ash)**

This is made by me and not an official CDP app. It's not perfect and it's not meant to be the end product though it's fully functional and production ready. I made this as your starting point so you don't have to start from scratch. It's meant to get you started to build your next idea 🤍

---

## 📄 License

MIT License - feel free to use this template for your projects!