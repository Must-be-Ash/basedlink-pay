# Get sell config

> The Sell Config API returns the list of countries supported by Coinbase Pay Offramp, and the fiat deposit methods available in each country. Clients should call this API periodically and cache the response.

## OpenAPI

````yaml GET /v1/sell/config
paths:
  path: /v1/sell/config
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
      query: {}
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              countries:
                allOf:
                  - items:
                      $ref: '#/components/schemas/SupportedCountry'
                    type: array
            description: List of supported countries and fiat deposit methods for selling
            refIdentifier: '#/components/schemas/GetSellConfigResponse'
        examples:
          example:
            value:
              countries:
                - id: <string>
                  paymentMethods:
                    - id: UNSPECIFIED
                  subdivisions:
                    - <string>
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
    PaymentMethodType:
      description: Payment method type
      properties:
        id:
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
      type: object
    SupportedCountry:
      description: Country and list of supported payment methods in that country
      properties:
        id:
          description: The ISO 3166-1 two letter country code e.g. `US`
          type: string
        paymentMethods:
          description: List of supported payments method IDs
          items:
            $ref: '#/components/schemas/PaymentMethodType'
          type: array
        subdivisions:
          description: >-
            List of subdivisions in the country, only returned for `US` because
            crypto asset availability differs by state in the US e.g. [`AL`,
            `AK`, `AZ, ``AR`, `CA`]
          items:
            type: string
          type: array
      type: object

````