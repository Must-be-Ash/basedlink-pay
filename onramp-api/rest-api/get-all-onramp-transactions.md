# Get all onramp transactions

> Returns all onramp transactions created by your app in the provided time period.

## OpenAPI

````yaml GET /v1/buy/transactions
paths:
  path: /v1/buy/transactions
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
        startDate:
          schema:
            - type: string
              description: >-
                Date of the oldest transaction to return e.g. `2025-01-02`, 
                `2025-01-02T15:04:05Z`, `2025-01-02T15:04:05+07:00`
        endDate:
          schema:
            - type: string
              description: >-
                Date of the newest transaction to return e.g. `2025-01-03`,
                `2025-01-02T15:04:05Z`, `2025-01-02T15:04:05+07:00`
        pageKey:
          schema:
            - type: string
              description: Page key returned by this API for pagination
        pageSize:
          schema:
            - type: integer
              description: The number of transactions to return, between 1 and 1000
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              nextPageKey:
                allOf:
                  - description: >-
                      The page key to be passed into this API to get the next
                      page of results
                    type: string
              transactions:
                allOf:
                  - description: List of transactions
                    items:
                      $ref: '#/components/schemas/OnrampTransaction'
                    type: array
            description: Get All Onramp Transactions response
            refIdentifier: '#/components/schemas/GetTransactionsForPartnerResponse'
        examples:
          example:
            value:
              nextPageKey: <string>
              transactions:
                - coinbaseFee:
                    currency: <string>
                    value: <string>
                  completedAt: '2023-11-07T05:31:56Z'
                  contractAddress: <string>
                  country: <string>
                  createdAt: '2023-11-07T05:31:56Z'
                  endPartnerName: <string>
                  exchangeRate:
                    currency: <string>
                    value: <string>
                  failureReason: FAILURE_REASON_BUY_FAILED
                  networkFee:
                    currency: <string>
                    value: <string>
                  partnerUserRef: <string>
                  paymentMethod: UNSPECIFIED
                  paymentSubtotal:
                    currency: <string>
                    value: <string>
                  paymentTotal:
                    currency: <string>
                    value: <string>
                  paymentTotalUsd:
                    currency: <string>
                    value: <string>
                  purchaseAmount:
                    currency: <string>
                    value: <string>
                  purchaseCurrency: <string>
                  purchaseNetwork: <string>
                  status: ONRAMP_TRANSACTION_STATUS_CREATED
                  transactionId: <string>
                  txHash: <string>
                  type: ONRAMP_TRANSACTION_TYPE_BUY_AND_SEND
                  userId: <string>
                  userType: USER_TYPE_AUTHED
                  walletAddress: <string>
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
    OnrampTransaction:
      description: OnrampTransaction
      properties:
        coinbaseFee:
          $ref: '#/components/schemas/Amount'
        completedAt:
          description: The completed at timestamp
          format: date-time
          type: string
        contractAddress:
          description: The user's contact address
          type: string
        country:
          description: The user's country
          type: string
        createdAt:
          description: The created at timestamp
          format: date-time
          type: string
        endPartnerName:
          description: The name of the developer app
          type: string
        exchangeRate:
          $ref: '#/components/schemas/Amount'
        failureReason:
          description: The reason for the transaction failure (if applicable)
          enum:
            - FAILURE_REASON_BUY_FAILED
            - FAILURE_REASON_SEND_FAILED
          format: enum
          type: string
        networkFee:
          $ref: '#/components/schemas/Amount'
        partnerUserRef:
          description: >-
            The `partnerUserId` provided when initializing the Onramp session
            that created this transaction
          type: string
        paymentMethod:
          description: The payment method type used to purchase the crypto
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
        paymentSubtotal:
          $ref: '#/components/schemas/Amount'
        paymentTotal:
          $ref: '#/components/schemas/Amount'
        paymentTotalUsd:
          $ref: '#/components/schemas/Amount'
        purchaseAmount:
          $ref: '#/components/schemas/Amount'
        purchaseCurrency:
          description: Purchase currency symbol e.g. `ETH`
          type: string
        purchaseNetwork:
          description: Network purchased crypto will be sent on e.g. `ethereum`
          type: string
        status:
          description: Current status of the transaction
          enum:
            - ONRAMP_TRANSACTION_STATUS_CREATED
            - ONRAMP_TRANSACTION_STATUS_IN_PROGRESS
            - ONRAMP_TRANSACTION_STATUS_SUCCESS
            - ONRAMP_TRANSACTION_STATUS_FAILED
          format: enum
          type: string
        transactionId:
          description: The unique transaction ID
          type: string
        txHash:
          description: The tx hash of the send
          type: string
        type:
          description: The type of Onramp transaction
          enum:
            - ONRAMP_TRANSACTION_TYPE_BUY_AND_SEND
            - ONRAMP_TRANSACTION_TYPE_SEND
          format: enum
          type: string
        userId:
          description: A has of the internal user ID
          type: string
        userType:
          description: The type of user
          enum:
            - USER_TYPE_AUTHED
            - USER_TYPE_GUEST
          format: enum
          type: string
        walletAddress:
          description: The address the crypto was sent to
          type: string
      type: object

````