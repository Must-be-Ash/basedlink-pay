# Create a new webhook

> Create a new webhook

## OpenAPI

````yaml POST /v1/webhooks
paths:
  path: /v1/webhooks
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
              network_id:
                allOf:
                  - type: string
                    example: base-sepolia
                    description: >-
                      Blockchain [network
                      identifier](/api-reference/networks#network-identifiers).
              event_type:
                allOf:
                  - $ref: '#/components/schemas/WebhookEventType'
              event_type_filter:
                allOf:
                  - $ref: '#/components/schemas/WebhookEventTypeFilter'
              event_filters:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/WebhookEventFilter'
                    description: >-
                      Webhook will monitor all events that matches any one of
                      the event filters.
              notification_uri:
                allOf:
                  - type: string
                    example: https://webhook.site/582307c2f9e1fac308a5f575
                    description: The URL to which the notifications will be sent
              signature_header:
                allOf:
                  - type: string
                    example: your-custom-header
                    description: >-
                      The custom header to be used for x-webhook-signature
                      header on callbacks, so developers can verify the requests
                      are coming from Coinbase.
            requiredProperties:
              - network_id
              - event_type
              - notification_uri
        examples:
          example:
            value:
              network_id: base-sepolia
              event_type: erc20_transfer
              event_type_filter:
                addresses:
                  - <string>
                wallet_id: d91d652b-d020-48d4-bf19-5c5eb5e280c7
              event_filters:
                - contract_address: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
                  from_address: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
                  to_address: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
              notification_uri: https://webhook.site/582307c2f9e1fac308a5f575
              signature_header: your-custom-header
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    example: 582307c2f9e1fac308a5f575
                    description: Identifier of the webhook.
              network_id:
                allOf:
                  - type: string
                    example: base-sepolia
                    description: Blockchain network identifier.
              event_type:
                allOf:
                  - $ref: '#/components/schemas/WebhookEventType'
              event_type_filter:
                allOf:
                  - $ref: '#/components/schemas/WebhookEventTypeFilter'
              event_filters:
                allOf:
                  - type: array
                    items:
                      $ref: '#/components/schemas/WebhookEventFilter'
                    description: >-
                      Webhook will monitor all events that matches any one of
                      the event filters.
              notification_uri:
                allOf:
                  - type: string
                    example: https://webhook.site/582307c2f9e1fac308a5f575
                    description: The URL to which the notifications will be sent.
              created_at:
                allOf:
                  - type: string
                    format: date-time
                    example: '2024-07-21T17:32:28Z'
                    description: The date and time the webhook was created.
              updated_at:
                allOf:
                  - type: string
                    format: date-time
                    example: '2024-07-21T17:32:28Z'
                    description: The date and time the webhook was last updated.
              signature_header:
                allOf:
                  - type: string
                    example: your-signature-header
                    description: >-
                      The header that will contain the signature of the webhook
                      payload.
              status:
                allOf:
                  - $ref: '#/components/schemas/WebhookStatus'
            description: >-
              Webhook that is used for getting notifications when monitored
              events occur.
            refIdentifier: '#/components/schemas/Webhook'
            requiredProperties:
              - status
        examples:
          example:
            value:
              id: 582307c2f9e1fac308a5f575
              network_id: base-sepolia
              event_type: erc20_transfer
              event_type_filter:
                addresses:
                  - <string>
                wallet_id: d91d652b-d020-48d4-bf19-5c5eb5e280c7
              event_filters:
                - contract_address: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
                  from_address: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
                  to_address: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
              notification_uri: https://webhook.site/582307c2f9e1fac308a5f575
              created_at: '2024-07-21T17:32:28Z'
              updated_at: '2024-07-21T17:32:28Z'
              signature_header: your-signature-header
              status: active
        description: The webhook
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
        description: Error response.
  deprecated: false
  type: path
components:
  schemas:
    WebhookEventType:
      type: string
      example: erc20_transfer
      enum:
        - unspecified
        - erc20_transfer
        - erc721_transfer
        - wallet_activity
        - smart_contract_event_activity
    WebhookStatus:
      type: string
      example: active
      description: The status of the webhook.
      enum:
        - active
        - inactive
    WebhookEventFilter:
      type: object
      description: >-
        The event_filter parameter specifies the criteria to filter events from
        the blockchain. It allows filtering events by contract address, sender
        address and receiver address. For a single event filter, not all of the
        properties need to be presented.
      properties:
        contract_address:
          type: string
          example: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
          description: >-
            The onchain contract address of the token for which the events
            should be tracked.
        from_address:
          type: string
          example: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
          description: >-
            The onchain address of the sender. Set this filter to track all
            transfer events originating from your address.
        to_address:
          type: string
          example: '0xfc807D1bE4997e5C7B33E4d8D57e60c5b0f02B1a'
          description: >-
            The onchain address of the receiver. Set this filter to track all
            transfer events sent to your address.
    WebhookEventTypeFilter:
      type: object
      description: >-
        The event_type_filter parameter specifies the criteria to filter events
        based on event type.
      oneOf:
        - $ref: '#/components/schemas/WebhookWalletActivityFilter'
        - $ref: '#/components/schemas/WebhookSmartContractEventFilter'
    WebhookWalletActivityFilter:
      type: object
      description: >
        Filter for wallet activity events. This filter allows the client to
        specify one or more wallet addresses

        to monitor for activities such as transactions, transfers, or other
        types of events that are associated

        with the specified addresses.
      properties:
        addresses:
          type: array
          items:
            type: string
          description: A list of wallet addresses to filter on.
        wallet_id:
          type: string
          example: d91d652b-d020-48d4-bf19-5c5eb5e280c7
          description: The ID of the wallet that owns the webhook.
      required:
        - wallet_id
    WebhookSmartContractEventFilter:
      type: object
      description: >
        Filter for smart contract events. This filter allows the client to
        specify smart contract addresses

        to monitor for activities such as contract function calls.
      properties:
        contract_addresses:
          type: array
          items:
            type: string
          description: A list of smart contract addresses to filter on.
      required:
        - contract_addresses

````