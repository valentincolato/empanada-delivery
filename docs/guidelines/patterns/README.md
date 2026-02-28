# Design Patterns Roadmap

These guides propose patterns to strengthen reliability and API consistency in Empanada Delivery.

## Proposed Guides

1. `idempotency_keys.md`
   - Prevent duplicate order creation on retries/timeouts.
2. `transactional_outbox.md`
   - Guarantee durable async notifications after successful writes.
3. `problem_details_errors.md`
   - Standardize API error responses with RFC 9457.

## Suggested Adoption Order

1. `problem_details_errors.md` (fast win, low risk)
2. `idempotency_keys.md` (high business impact for checkout)
3. `transactional_outbox.md` (highest reliability for async processing)

## Why These Patterns

- They directly target current flows (`POST /api/v1/orders`, status updates, async emails).
- They are well-established patterns with strong industry backing.
- They can be introduced incrementally without full architecture rewrite.
