# Get buy options

> The Buy Options API provides clients with a way to discover the available options for buying Crypto with Coinbase Onramp. It returns the supported fiat currencies and available crypto assets that can be passed into the Buy Quote API. Clients should call this API periodically for each country they support and cache the response.

## OpenAPI

````yaml GET /v1/buy/options
paths:
  path: /v1/buy/options
  method: get
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
      query:
        country:
          schema:
            - type: string
              description: The ISO 3166-1 two letter country code e.g. `US`
        subdivision:
          schema:
            - type: string
              description: >-
                The ISO 3166-2 two letter state code e.g. `NY`, only required
                for `US`
        networks:
          schema:
            - type: string
              description: >-
                Comma-separated list of network names (e.g. `ethereum,polygon`),
                available network names are returned in each crypto currency
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              paymentCurrencies:
                allOf:
                  - description: List of fiat currencies that can be used to buy crypto
                    items:
                      $ref: '#/components/schemas/FiatCurrency'
                    type: array
              purchaseCurrencies:
                allOf:
                  - description: List of crypto currencies that can be bought
                    items:
                      $ref: '#/components/schemas/PublicAsset'
                    type: array
            description: >-
              List of crypto assets available to buy, and fiat currencies that
              can be used to purchase
            refIdentifier: '#/components/schemas/GetBuyOptionsResponse'
        examples:
          example:
            value:
              paymentCurrencies:
                - id: <string>
                  limits:
                    - id: UNSPECIFIED
                      max: <string>
                      min: <string>
              purchaseCurrencies:
                - iconUrl: <string>
                  id: <string>
                  name: <string>
                  networks:
                    - chainId: 123
                      contractAddress: <string>
                      displayName: <string>
                      name: <string>
                  symbol: <string>
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
    FiatCurrency:
      description: Fiat currency and it's limits for each supported payment method
      properties:
        id:
          description: The fiat currency ID e.g. `USD`
          type: string
        limits:
          description: >-
            List of payment methods available for the currency, and their
            associated limits
          items:
            $ref: '#/components/schemas/PaymentMethodLimit'
          type: array
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
    PaymentMethodLimit:
      description: Min and max purchase limits for a payment method type
      properties:
        id:
          description: The Payment method type
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
        max:
          description: Max transaction amount e.g. `7500.00`
          type: string
        min:
          description: Min transaction amount e.g. `5.00`
          type: string
      type: object
    PublicAsset:
      description: Asset metadata to be shared over external public APIs
      properties:
        iconUrl:
          type: string
        id:
          type: string
        name:
          type: string
        networks:
          items:
            $ref: '#/components/schemas/PublicNetwork'
          type: array
        symbol:
          type: string
      type: object
    PublicNetwork:
      description: Network metadata to be shared over external public APIs
      properties:
        chainId:
          format: uint64
          type: integer
        contractAddress:
          type: string
        displayName:
          type: string
        name:
          type: string
      type: object

````