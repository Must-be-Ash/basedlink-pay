# Create wallet

> Create a new wallet scoped to the user.

## OpenAPI

````yaml POST /v1/wallets
paths:
  path: /v1/wallets
  method: post
  servers:
    - url: https://api.cdp.coinbase.com/platform
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
              wallet:
                allOf:
                  - description: Parameters for configuring a wallet
                    type: object
                    properties:
                      network_id:
                        type: string
                        example: base-sepolia
                        description: The ID of the blockchain network.
                      use_server_signer:
                        type: boolean
                        description: >-
                          Whether the wallet should use the project's
                          Server-Signer or if the addresses in the wallets will
                          belong to a private key the developer manages.
                          Defaults to false.
                    required:
                      - network_id
            requiredProperties:
              - wallet
        examples:
          example:
            value:
              wallet:
                network_id: base-sepolia
                use_server_signer: true
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    example: d43059c7-2cc8-471e-b39b-d6dfb279cc42
                    description: The server-assigned ID for the wallet.
              network_id:
                allOf:
                  - type: string
                    example: base-sepolia
                    description: The ID of the blockchain network.
              default_address:
                allOf:
                  - description: >-
                      The default address for the wallet. It is the first
                      address generated in the wallet.
                    $ref: '#/components/schemas/Address'
              feature_set:
                allOf:
                  - description: The feature set enabled for the network
                    $ref: '#/components/schemas/FeatureSet'
              server_signer_status:
                allOf:
                  - type: string
                    description: The status of the Server-Signer for the wallet if present.
                    enum:
                      - pending_seed_creation
                      - active_seed
            refIdentifier: '#/components/schemas/Wallet'
            requiredProperties:
              - id
              - network_id
              - feature_set
        examples:
          example:
            value:
              id: d43059c7-2cc8-471e-b39b-d6dfb279cc42
              network_id: base-sepolia
              default_address:
                wallet_id: d91d652b-d020-48d4-bf19-5c5eb5e280c7
                network_id: base-sepolia
                public_key: <string>
                address_id: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
              feature_set:
                faucet: true
                server_signer: true
                transfer: true
                trade: true
                stake: true
                gasless_send: true
              server_signer_status: pending_seed_creation
        description: The list of wallets
    default:
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - description: >-
                      A short string representing the reported error. Can be use
                      to handle errors programmatically.
                    maxLength: 5000
                    type: string
              message:
                allOf:
                  - description: >-
                      A human-readable message providing more details about the
                      error.
                    maxLength: 5000
                    type: string
              correlation_id:
                allOf:
                  - description: >-
                      A unique identifier for the request that generated the
                      error. This can be used to help debug issues with the API.
                    type: string
            description: An error response from the Coinbase Developer Platform API
            refIdentifier: '#/components/schemas/Error'
            requiredProperties:
              - code
              - message
        examples:
          example:
            value:
              code: <string>
              message: <string>
              correlation_id: <string>
        description: Error response
  deprecated: false
  type: path
components:
  schemas:
    Address:
      type: object
      properties:
        wallet_id:
          type: string
          example: d91d652b-d020-48d4-bf19-5c5eb5e280c7
          description: The ID of the wallet that owns the address
        network_id:
          type: string
          example: base-sepolia
          description: The ID of the blockchain network.
        public_key:
          type: string
          description: The public key from which the address is derived.
        address_id:
          type: string
          example: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
          description: The onchain address derived on the server-side.
      required:
        - wallet_id
        - network_id
        - public_key
        - address_id
      xml:
        name: address
    FeatureSet:
      type: object
      properties:
        faucet:
          type: boolean
          description: Whether the network supports a faucet
        server_signer:
          type: boolean
          description: Whether the network supports Server-Signers
        transfer:
          type: boolean
          description: Whether the network supports transfers
        trade:
          type: boolean
          description: Whether the network supports trading
        stake:
          type: boolean
          description: Whether the network supports staking
        gasless_send:
          type: boolean
          description: Whether the network supports gasless sends
      required:
        - faucet
        - server_signer
        - transfer
        - trade
        - stake
        - gasless_send
      xml:
        name: feature_set

````