# Clients / Adapters Guide

This repository currently has no `app/clients/` directory. Use this guide when introducing external integrations (payments, messaging providers, external APIs).

## Goal

Keep external protocol details out of workflows, actions, and controllers.

Recommended split:

- Workflow/Action: domain orchestration and decisions
- Client/Adapter: HTTP/auth/protocol details
- Response wrapper: normalized success/error interface

## Minimal Contract

```ruby
client = Payments::Client.new(api_key: ENV.fetch("PAYMENTS_API_KEY"))
response = client.create_payment(payload)

response.success?   # boolean
response.status     # integer HTTP status or mapped code
response.data       # parsed payload (hash)
response.error      # normalized error value or nil
```

## Rules

1. Clients receive primitives/hashes, not ActiveRecord objects.
2. Clients should not know app roles, slugs, or business policies.
3. Keep retries/timeouts explicit and observable.
4. Normalize third-party errors before returning.
5. Do not call clients directly from views/controllers when workflow logic is required.

## Suggested Folder Layout

```
app/clients/
  payments/
    client.rb
    request.rb
    response.rb
```

## Integration Boundary Example

```ruby
class CaptureOrderPayment
  def initialize(order:, payment_payload:)
    @order = order
    @payment_payload = payment_payload
  end

  def call
    response = Payments::Client.new(...).create_payment(@payment_payload)
    raise response.error unless response.success?

    @order.update!(payment_reference: response.data.fetch("id"))
  end
end
```

## Testing Strategy

- Unit test clients with HTTP stubs (request/response mapping)
- Unit/integration test workflows with client doubles
- Assert normalized error handling paths

## When Not to Add a Client

- Internal app-to-app Ruby calls (no external boundary)
- Simple one-off scripts that are not part of runtime flows
