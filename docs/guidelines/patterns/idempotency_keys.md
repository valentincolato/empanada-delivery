# Pattern Guide: Idempotency Keys for Order Creation

## Context in This Project

`POST /api/v1/orders` creates orders and enqueues notifications. If the client retries because of network timeout or frontend retries, duplicate orders can be created.

## Pattern Summary

Use an `Idempotency-Key` per client intent so repeated requests with the same key return the same outcome instead of creating a second order.

## Where to Apply

- Primary target: `POST /api/v1/orders`
- Optional later: admin mutation endpoints (`PATCH /api/v1/admin/orders/:id`, product/category create/update)

## Minimal Contract

Request headers:

- `Idempotency-Key: <uuid>`

Server behavior:

1. First request with key -> process normally, persist response snapshot.
2. Same key + same request fingerprint -> return stored response.
3. Same key + different payload -> return `409 Conflict`.

## Data Model Sketch

Table: `idempotency_keys`

- `key` (string, unique)
- `scope` (string, e.g. `orders#create`)
- `request_hash` (string)
- `response_status` (integer)
- `response_body` (jsonb)
- `expires_at` (datetime)
- timestamps

## Integration Points

- Controller layer validates header presence/format for protected endpoints.
- Workflow/action executes only when no prior successful record exists.
- Transaction writes business data and idempotency record atomically.

## Rollout Plan

1. Implement storage + lookup service.
2. Protect `POST /api/v1/orders`.
3. Add replay metrics (`idempotency.hit`, `idempotency.miss`, `idempotency.conflict`).
4. Document requirement for frontend/mobile clients.

## Testing Checklist

- Same key + same payload returns identical response and no new order.
- Same key + different payload returns `409`.
- Key expiration behavior is deterministic.
- Concurrent duplicate requests do not double-create orders.

## References (checked: February 28, 2026)

- Stripe API docs (idempotent requests): https://docs.stripe.com/api/idempotent_requests
- IETF HTTP Semantics (safe/idempotent method concepts): https://www.rfc-editor.org/rfc/rfc9110
