import type { EvmAddress } from "@coinbase/cdp-core"

const BASE_RPC_URL = "https://mainnet.base.org"
const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

export interface BalanceInfo {
  hasEnoughBalance: boolean
  currentBalance: string
  formattedBalance: string
  isChecking: boolean
}

export interface OnrampSessionToken {
  token: string
  channelId: string
}

export interface CreateSessionTokenRequest {
  addresses: Array<{
    address: string
    blockchains: string[]
  }>
  assets?: string[]
}

export async function checkWalletBalance(
  address: EvmAddress | null,
  requiredAmount: string
): Promise<BalanceInfo> {
  if (!address) {
    return {
      hasEnoughBalance: false,
      currentBalance: "0",
      formattedBalance: "0.00",
      isChecking: false,
    }
  }

  try {
    // Check USDC balance using ERC20 balanceOf method
    const response = await fetch(BASE_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: USDC_CONTRACT_ADDRESS,
            data: `0x70a08231000000000000000000000000${address.slice(2)}`
          },
          "latest"
        ],
        id: 1,
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const balanceHex = data.result
    const balanceWei = BigInt(balanceHex)
    const requiredWei = BigInt(Math.floor(Number.parseFloat(requiredAmount) * 1e6)) // USDC has 6 decimals
    
    const balanceUsdc = Number(balanceWei) / 1e6
    const formattedBalance = balanceUsdc.toFixed(2)
    
    return {
      hasEnoughBalance: balanceWei >= requiredWei,
      currentBalance: balanceWei.toString(),
      formattedBalance,
      isChecking: false,
    }
  } catch (error) {
    console.error("Error checking USDC balance:", error)
    return {
      hasEnoughBalance: false,
      currentBalance: "0",
      formattedBalance: "0.00",
      isChecking: false,
    }
  }
}

export function generateOnrampURL(
  sessionToken: string,
  userAddress: string,
  presetAmount?: string
): string {
  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: "USDC",
    defaultNetwork: "base",
    fiatCurrency: "USD",
    defaultPaymentMethod: "CARD",
  })
  
  if (presetAmount) {
    params.append("presetFiatAmount", presetAmount) // USDC = USD 1:1
  }

  return `${baseURL}?${params.toString()}`
}

export function generateOneClickBuyURL(
  sessionToken: string,
  userAddress: string,
  usdcAmount: string
): string {
  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const usdAmount = Number.parseFloat(usdcAmount) // USDC = USD 1:1
  
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: "USDC",
    defaultNetwork: "base",
    defaultPaymentMethod: "CARD",
    fiatCurrency: "USD",
    presetFiatAmount: usdAmount.toString(),
  })

  return `${baseURL}?${params.toString()}`
}

export interface GuestCheckoutLimits {
  weeklyLimit: number
  minimumAmount: number
  supportedPaymentMethods: string[]
  supportedCountries: string[]
}

export const GUEST_CHECKOUT_LIMITS: GuestCheckoutLimits = {
  weeklyLimit: 500,
  minimumAmount: 5,
  supportedPaymentMethods: ["CARD", "APPLE_PAY"],
  supportedCountries: ["US"]
} 