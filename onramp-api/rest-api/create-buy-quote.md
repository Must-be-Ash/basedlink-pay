# Create buy quote

> The Buy Quote API provides clients with a quote based on the asset the user would like to purchase, the network they want to receive it on, the fiat amount of the payment, the payment currency, the payment method, and country of the user.

## OpenAPI

````yaml POST /v1/buy/quote
paths:
  path: /v1/buy/quote
  method: post
  servers:
    - url: https://api.developer.coinbase.com/onramp
  request:
    security:
      - title: bearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                Enter your JSON Web Token (JWT) here. Refer to the [Generate
                JWT](/api-reference/authentication#2-generate-jwt-server-only)
                section of our Authentication docs for information on how to
                generate your Bearer Token.
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              country:
                allOf:
                  - description: The ISO 3166-1 two letter country code e.g. `US`
                    type: string
              paymentAmount:
                allOf:
                  - description: >-
                      Amount of fiat to be converted to purchase_currency e.g.
                      `100.00`
                    type: string
              paymentCurrency:
                allOf:
                  - description: Fiat currency for payment_amount e.g. `USD`
                    type: string
              paymentMethod:
                allOf:
                  - description: The type of payment method to be used to purchase
                    enum:
                      - UNSPECIFIED
                      - CARD
                      - ACH_BANK_ACCOUNT
                      - APPLE_PAY
                      - FIAT_WALLET
                      - CRYPTO_ACCOUNT
                      - GUEST_CHECKOUT_CARD
                      - PAYPAL
                      - RTP
                      - GUEST_CHECKOUT_APPLE_PAY
                    format: enum
                    type: string
              purchaseCurrency:
                allOf:
                  - description: >-
                      The ticker (e.g. `BTC`, `USDC`) or the UUID (e.g.
                      `d85dce9b-5b73-5c3c-8978-522ce1d1c1b4`) of crypto asset to
                      be purchased
                    type: string
              purchaseNetwork:
                allOf:
                  - description: Network name to receive crypto on e.g. `ethereum`, `base`
                    type: string
              subdivision:
                allOf:
                  - description: >-
                      The ISO 3166-2 two letter state code e.g. `NY`, only
                      required for `US`
                    type: string
            required: true
            description: Create Buy Quote API request parameters
            refIdentifier: '#/components/schemas/CreateBuyQuoteRequest'
            requiredProperties:
              - purchaseCurrency
              - paymentAmount
              - paymentCurrency
              - paymentMethod
              - country
        examples:
          example:
            value:
              country: <string>
              paymentAmount: <string>
              paymentCurrency: <string>
              paymentMethod: UNSPECIFIED
              purchaseCurrency: <string>
              purchaseNetwork: <string>
              subdivision: <string>
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              coinbaseFee:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              networkFee:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              paymentSubtotal:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              paymentTotal:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              purchaseAmount:
                allOf:
                  - $ref: '#/components/schemas/Amount'
              quoteId:
                allOf:
                  - description: >-
                      UUID that should be passed into the Onramp Widget URL as
                      the `quoteId` query parameter
                    type: string
            description: Create Buy Quote API response
            refIdentifier: '#/components/schemas/CreateBuyQuoteResponse'
        examples:
          example:
            value:
              coinbaseFee:
                currency: <string>
                value: <string>
              networkFee:
                currency: <string>
                value: <string>
              paymentSubtotal:
                currency: <string>
                value: <string>
              paymentTotal:
                currency: <string>
                value: <string>
              purchaseAmount:
                currency: <string>
                value: <string>
              quoteId: <string>
        description: OK
    default:
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - description: >-
                      The status code, which should be an enum value of
                      [google.rpc.Code][google.rpc.Code].
                    format: int32
                    type: integer
              details:
                allOf:
                  - description: >-
                      A list of messages that carry the error details.  There is
                      a common set of message types for APIs to use.
                    items:
                      $ref: '#/components/schemas/GoogleProtobufAny'
                    type: array
              message:
                allOf:
                  - description: >-
                      A developer-facing error message, which should be in
                      English. Any user-facing error message should be localized
                      and sent in the
                      [google.rpc.Status.details][google.rpc.Status.details]
                      field, or localized by the client.
                    type: string
            description: >-
              The `Status` type defines a logical error model that is suitable
              for different programming environments, including REST APIs and
              RPC APIs. It is used by [gRPC](https://github.com/grpc). Each
              `Status` message contains three pieces of data: error code, error
              message, and error details. You can find out more about this error
              model and how to work with it in the [API Design
              Guide](https://cloud.google.com/apis/design/errors).
            refIdentifier: '#/components/schemas/Status'
        examples:
          example:
            value:
              code: 123
              details:
                - '@type': <string>
              message: <string>
        description: Default error response
  deprecated: false
  type: path
components:
  schemas:
    Amount:
      description: A monetary amount represented by a decimal value and currency symbol
      properties:
        currency:
          description: Currency symbol e.g. `USD`, `BTC`
          type: string
        value:
          description: Non-localized amount in decimal notation (e.g. `1.234`)
          type: string
      type: object
    GoogleProtobufAny:
      additionalProperties: true
      description: >-
        Contains an arbitrary serialized message along with a @type that
        describes the type of the serialized message.
      properties:
        '@type':
          description: The type of the serialized message.
          type: string
      type: object

````