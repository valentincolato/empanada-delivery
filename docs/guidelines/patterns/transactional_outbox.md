# Pattern Guide: Transactional Outbox

## Context in This Project

Current workflows enqueue jobs after writes (for example, after placing an order or updating status). If the app commits DB changes but crashes before enqueue, side effects may be lost.

## Pattern Summary

Write domain changes and an outbox event in the same DB transaction. A dispatcher process publishes queued outbox events to background jobs/retries safely.

## Where to Apply

- `PlaceOrder` -> `order.created`
- `UpdateOrderStatus` -> `order.status_changed`

## Data Model Sketch

Table: `outbox_events`

- `event_type` (string)
- `aggregate_type` (string, e.g. `Order`)
- `aggregate_id` (bigint/string)
- `payload` (jsonb)
- `status` (enum/string: `pending`, `processing`, `sent`, `failed`)
- `available_at` (datetime for backoff)
- `sent_at` (datetime)
- `error_message` (text)
- timestamps

## Flow

1. Inside transaction:
   - write business row(s)
   - write outbox event row
2. Dispatcher job polls `pending` events in batches.
3. Dispatcher emits side effect (enqueue mailer job, webhook, etc.).
4. Mark event `sent` (or reschedule with backoff on failure).

## Implementation Notes for Rails

- Use DB locking (`FOR UPDATE SKIP LOCKED`) in dispatcher to avoid double processing.
- Keep handlers idempotent (an event may be retried).
- Add retention/cleanup policy for sent events.

## Rollout Plan

1. Introduce outbox table + dispatcher job.
2. Migrate one path (`order.created`) first.
3. Add metrics and alerting on stuck/failed events.
4. Migrate remaining asynchronous side effects.

## Testing Checklist

- Event is persisted when transaction commits.
- No event exists when transaction rolls back.
- Dispatcher retries failed events with backoff.
- Duplicate dispatch attempts do not duplicate external effects.

## References (checked: February 28, 2026)

- Microservices.io: Transactional Outbox pattern: https://microservices.io/patterns/data/transactional-outbox.html
- AWS Prescriptive Guidance (transactional outbox): https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html
