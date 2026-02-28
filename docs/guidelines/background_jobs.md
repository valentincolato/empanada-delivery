# Background Jobs

This document describes how background jobs work in this project.

## Queue Adapter by Environment

| Environment | Adapter | Source |
|---|---|---|
| development | `sidekiq` | `config/application.rb` |
| test | `test` | `config/environments/test.rb` |
| production | `solid_queue` | `config/environments/production.rb` |

Notes:
- In development, `docker compose` includes a `sidekiq` service.
- In production, jobs run through `Solid Queue` (database-backed queue).

## Queue Names Used in This App

Current jobs use these queues:

- `high`
  - `NotifyRestaurantNewOrderJob`
  - `NotifyCustomerOrderStatusJob`
- `low`
  - `CleanupOldPendingOrdersJob`
- `default`
  - Any job without explicit `queue_as`

## How to Create a Job

```ruby
class ExampleJob < ApplicationJob
  queue_as :default

  def perform(record_id)
    # keep perform focused and idempotent
  end
end
```

Guidelines:
- Prefer passing IDs, not full objects.
- Keep `perform` idempotent (safe to retry).
- Keep business orchestration in workflows/aggregates, not in controllers.

## How to Enqueue

```ruby
ExampleJob.perform_later(record.id)
```

Do not use `Delayed::Job.enqueue` in this project.

## Recurring Jobs

Recurring tasks are configured in `config/recurring.yml`.

Current recurring task in production:
- `clear_solid_queue_finished_jobs` (hourly cleanup of completed jobs)

## Operations Checklist

When adding or changing jobs:
1. Choose the queue with explicit `queue_as`.
2. Ensure retries are safe (idempotency).
3. Add tests for behavior and side effects.
4. If it is recurring, update `config/recurring.yml`.
