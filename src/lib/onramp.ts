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
    // Check both USDC and ETH balances
    const [usdcResponse, ethResponse] = await Promise.all([
      // USDC balance
      fetch(BASE_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      }),
      // ETH balance for gas
      fetch(BASE_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
          id: 2,
        }),
      })
    ])

    const [usdcData, ethData] = await Promise.all([
      usdcResponse.json(),
      ethResponse.json()
    ])
    
    if (usdcData.error) {
      throw new Error(usdcData.error.message)
    }
    if (ethData.error) {
      throw new Error(ethData.error.message)
    }

    const balanceHex = usdcData.result
    const balanceWei = BigInt(balanceHex)
    const requiredWei = BigInt(Math.floor(Number.parseFloat(requiredAmount) * 1e6)) // USDC has 6 decimals
    
    const balanceUsdc = Number(balanceWei) / 1e6
    const formattedBalance = balanceUsdc.toFixed(2)
    
    // Check ETH balance for gas (estimate ~0.0002 ETH needed for gas on Base)
    const ethBalanceWei = BigInt(ethData.result)
    const minGasEth = BigInt(2e14) // 0.0002 ETH in wei (more realistic for Base network)
    const hasEnoughGas = ethBalanceWei >= minGasEth
    
    const hasEnoughUsdc = balanceWei >= requiredWei
    const hasEnoughBalance = hasEnoughUsdc && hasEnoughGas
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Balance check:', {
        address: address.slice(0, 6) + '...' + address.slice(-4),
        usdcBalance: balanceUsdc.toFixed(6),
        ethBalanceWei: ethBalanceWei.toString(),
        ethBalanceEth: (Number(ethBalanceWei) / 1e18).toFixed(6),
        minGasRequired: (Number(minGasEth) / 1e18).toFixed(6),
        hasEnoughUsdc,
        hasEnoughGas,
        hasEnoughBalance
      })
    }
    
    // Add gas warning to balance display if needed
    let displayBalance = formattedBalance
    if (hasEnoughUsdc && !hasEnoughGas) {
      displayBalance = `${formattedBalance} (needs ETH for gas)`
    }
    
    return {
      hasEnoughBalance,
      currentBalance: balanceWei.toString(),
      formattedBalance: displayBalance,
      isChecking: false,
    }
  } catch (error) {
    console.error("Error checking wallet balance:", error)
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
  minimumAmount: 1,
  supportedPaymentMethods: ["CARD", "APPLE_PAY"],
  supportedCountries: ["US"]
} 