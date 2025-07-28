# Create session token

> Creates a single use token that can be used to initialize an Onramp or Offramp session.
 This API should be called once for every new user session. The returned token will expire after 5 minutes.

## OpenAPI

````yaml POST /v1/token
paths:
  path: /v1/token
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
              addresses:
                allOf:
                  - description: >-
                      Use this parameter to provide the addresses customers
                      funds should be delivered to for this session. Each entry
                      in the record represents a wallet address and the networks
                      it is valid for. There should only be a single address for
                      each network your app supports. Users will be able to
                      buy/sell any asset supported by any of the networks you
                      specify. See the assets param if you want to restrict the
                      available assets. <br /><br />For example:<br /><br />
                      Support all assets that are available for sending on the
                      base network, only on the base network:<br /> `[{ address:
                      "0x1", blockchains: ["base"] }]`
                    items:
                      $ref: '#/components/schemas/AddressEntry'
                    type: array
              assets:
                allOf:
                  - description: >-
                      This optional parameter will restrict the assets available
                      for the user to buy/send. It acts as a filter on the
                      networks specified in the addresses param. Each string in
                      the list should be an asset ticker e.g. `BTC`, `ETH`. The
                      list of available asset tickers can be retrieved from the
                      Buy Options and Sell Options APIs. <br /><br />For
                      example:<br /><br /> Support only USDC on either the base
                      network or the ethereum network:<br /> `addresses: [{
                      address: "0x1", blockchains: ["base", "ethereum"] }],
                      assets: ["USDC"]`
                    items:
                      type: string
                    type: array
              destinationWallets:
                allOf:
                  - description: >-
                      **[Deprecated] Please use the addresses and assets params
                      instead.**<br /> This parameter controls which crypto
                      assets your user will be able to buy/sell, which wallet
                      address their asset will be delivered to, and which
                      networks their assets will be delivered on. <br /><br
                      />For example:<br /><br /> Support all assets that are
                      available for sending on the base network, only on the
                      base network:<br /> `[{ address: "0x1", blockchains:
                      ["base"] }]`<br /><br /> Support only USDC on either the
                      base network or the ethereum network:<br /> `[{ address:
                      "0x1", assets: ["USDC"], supportedNetworks: ["base",
                      "ethereum"] }]`
                    items:
                      $ref: '#/components/schemas/DestinationWalletOnrampParam'
                    type: array
            required: true
            description: Request to create an onramp/offramp session token
            refIdentifier: '#/components/schemas/CreateOnrampTokenRequest'
            requiredProperties:
              - addresses
        examples:
          example:
            value:
              addresses:
                - address: <string>
                  blockchains:
                    - <string>
              assets:
                - <string>
              destinationWallets:
                - address: <string>
                  assets:
                    - <string>
                  blockchains:
                    - <string>
                  supportedNetworks:
                    - <string>
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              channelId:
                allOf:
                  - description: Reserved for future use.
                    type: string
              token:
                allOf:
                  - description: >-
                      The single use token that can be used to initialize an
                      onramp/offramp session.
                    type: string
            description: Response from the Create Token API
            refIdentifier: '#/components/schemas/CreateOnrampTokenResponse'
        examples:
          example:
            value:
              channelId: <string>
              token: <string>
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
    AddressEntry:
      description: AddressEntry
      properties:
        address:
          description: >-
            Destination address where the purchased assets will be sent for the
            assets/networks listed in the other fields. e.g.
            `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`,
            `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
          type: string
        blockchains:
          description: >-
            List of networks enabled for the associated address. Users will be
            able to buy/sell any asset supported by any of the networks you
            specify. e.g. `["ethereum", "base"]`, `["bitcoin"]`
          items:
            type: string
          type: array
      required:
        - address
        - blockchains
      type: object
    DestinationWalletOnrampParam:
      description: >-
        The destination wallet app param for Onramp Widget
        https://docs.cloud.coinbase.com/pay-sdk/docs/generating-url#destinationwallets-parameters
      properties:
        address:
          description: >-
            Destination address where the purchased assets will be sent for the
            assets/networks listed in the other fields. e.g.
            `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`,
            `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
          type: string
        assets:
          description: >-
            List of assets enabled for the associated address. If blockchains is
            non-empty, these assets will be available in addition to all assets
            supported by the networks in the blockchains field. If blockchains
            is empty, only these asset will be available. e.g. `["ETH", "USDC"],
            `["BTC"]`
          items:
            type: string
          type: array
        blockchains:
          description: >-
            List of networks enabled for the associated address. For any
            networks in this field, the user will be able to buy/sell any asset
            that is supported on this network. If you only want to support a
            subset of assets, leave this empty and use the assets field instead.
            e.g. `["ethereum", "base"]`, `["bitcoin"]`
          items:
            type: string
          type: array
        supportedNetworks:
          description: >-
            Restrict the networks available for assets in the assets field. If
            the blockchains field is empty, only these networks will be
            available. Otherwise these networks will be available in addition to
            the networks in blockchains. e.g. `["ethereum", "base"]`,
            `["bitcoin"]`
          items:
            type: string
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

````