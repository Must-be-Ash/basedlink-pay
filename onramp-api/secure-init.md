# Secure Init Migration

<Warning>
  **Migrating to Secure Init is now required for all apps moving forward. Please upgrade your app by 7/31/2025.**

  This migration is mandatory for continued access to Coinbase Onramp and Offramp APIs.
</Warning>

## What is Secure Init?

Secure Init is an authentication method for Coinbase Onramp and Offramp that uses session tokens instead of passing the `appId` and `addresses` parameters directly in URLs. With Secure Init, you generate a session token on your backend server using your CDP API keys, then pass that token in the URL instead of including wallet addresses and other data as query parameters.

## Migration Timeline

* **June 27, 2025**: Secure Init becomes the default behavior for all new apps
* **July 31, 2025**: Secure Init becomes mandatory for all existing apps

## What Changes with Secure Init?

### Without Secure Init

```bash
https://pay.coinbase.com/buy/select-asset?appId=your-app-id&addresses={"0x123...":["ethereum","base"]}&<other params>
```

### With Secure Init

```bash
https://pay.coinbase.com/buy/select-asset?sessionToken=<token>&<other params>
```

## Migration Steps

### Step 1: Create a CDP Secret API Key

If you don't already have one, create a Secret API Key in the [CDP Portal](https://portal.cdp.coinbase.com/projects/api-keys):

1. Navigate to your project's **API Keys** tab
2. Select the **Secret API Keys** section
3. Click **Create API key**
4. Configure your key settings (IP allowlist recommended)
5. Download and securely store your API key

<Tip>
  For Secure Init, you'll need a Secret API Key (not a Client API Key) since session tokens must be generated server-side.
</Tip>

### Step 2: Set Up JWT Authentication

To generate session tokens, you need to authenticate with CDP using JWT Bearer tokens. Follow the [CDP API key authentication guide](/api-reference/v2/authentication#generate-bearer-token-jwt-and-export) to set up JWT generation.

### Step 3: Generate Session Tokens

Use the Session Token API to generate tokens for each user session:

```bash
curl -X POST 'https://api.developer.coinbase.com/onramp/v1/token' \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      {
        "address": "0x4315d134aCd3221a02dD380ADE3aF39Ce219037c",
        "blockchains": ["ethereum", "base"]
      }
    ],
    "assets": ["ETH", "USDC"]
  }'
```

**Response:**

```json
{
  "data": {
    "token": "ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh",
    "channel_id": ""
  }
}
```

### Step 4: Update Your URLs

Replace your existing Onramp/Offramp URLs with the new session token format:

#### Onramp URL Examples

**Before:**

```bash
https://pay.coinbase.com/buy/select-asset?appId=your-app-id&addresses={"0x123...":["ethereum","base"]}&assets=["ETH","USDC"]&defaultNetwork=base&presetFiatAmount=100
```

**After:**

```bash
https://pay.coinbase.com/buy/select-asset?sessionToken=ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh&defaultNetwork=base&presetFiatAmount=100
```

#### Offramp URL Examples

**Before:**

```bash
https://pay.coinbase.com/v3/sell/input?appId=your-app-id&partnerUserId=user123&addresses={"0x123...":["ethereum"]}&assets=["ETH","BTC"]&redirectUrl=https://yourapp.com/success
```

**After:**

```bash
https://pay.coinbase.com/v3/sell/input?sessionToken=ZWJlNDgwYmItNjBkMi00ZmFiLWIxYTQtMTM3MGI2YjJiNjFh&partnerUserId=user123&redirectUrl=https://yourapp.com/success
```

### Step 5: Set Secure Init to enabled in your project on Portal

1. Navigate to your project in Portal, and go to the **Payments -> Onramp** tab
2. Toggle the **Enforce secure initialization** switch to **Enabled**

You're all set! 🚀

## Important Considerations

### Session Token Properties

* **Expiration**: Session tokens expire after 5 minutes
* **Single-use**: Each token can only be used once
* **Server-side generation**: Must be generated on your backend server

### URL Parameter Changes

When using session tokens, these parameters are **no longer needed** in the URL:

* `appId` (automatically included via session token)
* `addresses` (included in session token generation)
* `assets` (optional, can be included in session token generation)

These parameters **can still be used**:

* `defaultNetwork`
* `defaultAsset`
* `presetCryptoAmount`
* `presetFiatAmount`
* `defaultExperience`
* `defaultPaymentMethod`
* `fiatCurrency`
* `handlingRequestedUrls`
* `partnerUserId`
* `redirectUrl`
* `endPartnerName`

## Support and Resources

* **Authentication Guide**: [CDP API Key Authentication](/api-reference/v2/authentication)
* **Community Support**: [CDP Discord](https://discord.com/invite/cdp)
