# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **crypto payment platform** that mimics Stripe Link's functionality using CDP Embedded Wallets. Users can create products, generate payment links, and accept USDC payments via embedded wallets on the Base network.

## Development Commands

### Daily Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Database utilities
npm run db:indexes     # Create MongoDB indexes
npm run clean         # Remove .next folder
npm run reset         # Clean reinstall
```

## Technology Stack & Architecture

### Core Stack
- **Next.js 15** with App Router and React 19
- **TypeScript** with strict mode
- **MongoDB** with Mongoose ODM (database: `crypto-stripe-link`)
- **CDP Embedded Wallets** for USDC payments on Base network
- **Tailwind CSS v4** for styling
- **Zod** for validation schemas

### Key Architectural Patterns

#### CDP Integration Flow
The app uses `@coinbase/cdp-hooks` for wallet operations:
1. Email-based authentication via `useCurrentUser()`
2. Wallet address retrieval via `useEvmAddress()`
3. USDC transactions on Base network
4. Session management with localStorage persistence

#### Database Models (MongoDB)
Located in `src/lib/models/`:
- **UserModel**: Handles user creation, username generation, wallet syncing
- **ProductModel**: Product CRUD with unique slug generation, price conversion (USD → USDC)
- **PaymentModel**: Transaction records with Base network integration

#### Component Architecture
- **PaymentButton**: Multi-state payment flow (idle → processing → success/error/insufficient_balance)
- **ProductForm**: Create/edit with Zod validation and image upload to Vercel Blob
- **ProductCard**: Display with share functionality and payment links
- **WalletAuth**: CDP wallet connection and OTP verification

### Authentication & Session Management
The `useUserSession` hook manages:
- CDP wallet authentication state
- Database user synchronization
- Email persistence across page reloads
- Onboarding completion tracking

### File Structure Patterns
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes with Zod validation
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Protected user dashboard
│   ├── pay/[slug]/     # Public payment pages
│   └── onboarding/     # User onboarding flow
├── components/         # React components
│   ├── ui/            # Reusable UI components (shadcn/ui style)
│   └── [feature]/     # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
│   ├── models/        # Database models with business logic
│   └── validation.ts  # Zod schemas
└── types/            # TypeScript definitions
```

## Environment Configuration

Required environment variables:
```bash
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

## Development Patterns

### API Route Pattern
All API routes follow this structure:
1. Zod validation for request body
2. MongoDB operations via model classes
3. Consistent error handling with try/catch
4. Standard response format: `{ success: boolean, data?: T, error?: string }`

### Database Operations
- Use model classes (e.g., `UserModel.create()`) instead of direct MongoDB calls
- ObjectId conversion handled within models
- Unique constraints handled at application level (usernames, slugs)
- UTC timestamps for all date fields

### Payment Flow Architecture
1. **Product Creation**: Generate unique slug, set USD/USDC prices
2. **Payment Page**: Load product by slug, show PaymentButton
3. **Payment Process**: Check balance → insufficient? show onramp → success/error states
4. **Transaction**: Direct USDC transfer to seller's wallet address

### Wallet Integration
- CDP hooks manage wallet state automatically
- Balance checking via `useWalletBalance` hook
- Onramp integration for insufficient balance scenarios
- Base network for all USDC transactions

## Common Development Tasks

### Adding New Database Models
1. Create TypeScript types in `src/types/`
2. Implement model class in `src/lib/models/` following existing patterns
3. Add collection name to `COLLECTIONS` constant in `mongodb.ts`
4. Create corresponding API routes with Zod validation

### Payment Flow Modifications
- PaymentButton component handles all payment states
- Balance checking happens in `useWalletBalance` hook
- Transaction logic in `useTransaction` hook
- Onramp integration via `useOnramp` hook

### Product Management
- Slug generation ensures uniqueness across all products
- Image uploads handled via Vercel Blob storage
- Price conversion (USD → USDC) at 1:1 ratio (configurable)
- Soft delete support via `isActive` flag

## Security & Production Notes

### MongoDB Configuration
- Connection pooling handled automatically
- Development: global connection reuse for HMR
- Production: fresh connections per request
- Database name: `crypto-stripe-link`

### Next.js Configuration
- MongoDB externalized to prevent client-side bundling
- Security headers configured for API routes
- Image domains whitelisted: `localhost`, `stablelink.xyz`
- Webpack fallbacks for Node.js modules

### CDP Security
- Project ID exposed as public environment variable
- Private keys never stored in application code
- Wallet operations scoped to authenticated users only
- Session persistence via localStorage (not cookies)