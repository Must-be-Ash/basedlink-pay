# One-click-buy Onramp URL

Prefill all query string parameters in the Onramp URL and take users straight to the order preview screen!
If a user does not have an active Coinbase account session, they are taken to Guest Checkout.

There are a few ways to generate a One-Click-Buy URL:

1. Use the [getOnrampBuyUrl](https://docs.base.org/builderkits/onchainkit/fund/get-onramp-buy-url) util to generate a URL
2. Use the [`<FundCard />`](https://onchainkit.xyz/fund/fund-card) or [`<FundButton />`](https://onchainkit.xyz/fund/fund-button) UI React component

<Tip>
  Specify all the parameters in the util to get one-click-buy experience
</Tip>

<Info>
  Should my App use One-click-buy?

  If your users have already selected the asset they want to buy, an amount, and/or a payment method in your App, **yes**.
  If you want to preset these values for your users, **yes**.
</Info>

### Manually generating One-Click-Buy URLs

<Tip>
  Full API endpoint list

  For a complete list of all API endpoints supported by Onramp/Offramp, visit our [API Reference section](/api-reference/rest-api/onramp-offramp/create-buy-quote).
</Tip>

### Generating One-Click-Buy URLs

One-Click-Buy URLs must have following query parameters set in the URL:

* `presetFiatAmount` or `presetCryptoAmount`
* `fiatCurrency` required for `presetFiatAmount`
* `defaultAsset`
* `defaultPaymentMethod`

Then it initializes Coinbase Onramp with the appropriate parameters to execute that buy.

For example:

```bash
https://pay.coinbase.com/buy/select-asset?appId=58a3fa2e-617f-4198-81e7-096f5e498c00&addresses=[{"address":"0x750EF1D7a0b4Ab1c97B7A623D7917CcEb5ea779C","blockchains":["ethereum"]}]&defaultAsset=ETH&defaultPaymentMethod=CARD&fiatCurrency=USD&presetFiatAmount=10&quoteId=ae77980c-f656-4c69-b380-cb5cf99276a9
```

Send only URL:

```bash
https://pay.coinbase.com/buy/select-asset?appId=58a3fa2e-617f-4198-81e7-096f5e498c00&addresses=[{"address":"0x750EF1D7a0b4Ab1c97B7A623D7917CcEb5ea779C","blockchains":["ethereum"]}]&defaultAsset=USDC&defaultPaymentMethod=CRYPTO_ACCOUNT&presetCryptoAmount=10
```

### Query parameters

| Parameter            | Reqd | Type   | Description                                                                                                                                                                                                                                                                                                               |
| :------------------- | :--- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| defaultAsset         | Yes  | String | UUID of asset. <br /><br />*Received from [Onramp Options](/onramp-&-offramp/onramp-apis/countries-&-currencies) and sent to [Buy Quote](/onramp-&-offramp/onramp-apis/generating-quotes).*                                                                                                                               |
| defaultPaymentMethod | Yes  | String | Default payment method, one of: <ul> <li>`CRYPTO_ACCOUNT`</li> <li>`FIAT_WALLET`</li> <li>`CARD`</li> <li>`ACH_BANK_ACCOUNT`</li> <li>`APPLE_PAY`</li></ul> <i>Received from [Buy Options](/onramp-&-offramp/onramp-apis/generating-quotes) and sent to [Buy Quote](/onramp-&-offramp/onramp-apis/generating-quotes).</i> |
| fiatCurrency         | Yes  | String | Ticker symbol of the fiat currency.                                                                                                                                                                                                                                                                                       |
| presetFiatAmount     | Yes  | Number | Amount in fiat to be spent on the crypto purchase, fees included.                                                                                                                                                                                                                                                         |
| presetCryptoAmount   | Yes  | Number | Use this instead of presetFiatAmount with defaultPaymentMethod set to `CRYPTO_ACCOUNT` for send only.                                                                                                                                                                                                                     |
| quoteId              | No   | String | ID of the quote. *Received from [Onramp Quote](/onramp-&-offramp/onramp-apis/generating-quotes).*                                                                                                                                                                                                                         |
| defaultNetwork       | No   | String | Default network that should be selected when multiple networks are present. When not set, default is the asset network. <br /><br />*Received from [Buy Options](/onramp-&-offramp/onramp-apis/countries-&-currencies) and sent to [Buy Quote](/onramp-&-offramp/onramp-apis/generating-quotes).*                         |
