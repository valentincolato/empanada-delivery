# Background Jobs Guide

This project uses Active Job with different adapters per environment.

## Queue Adapter by Environment

| Environment | Adapter | Source |
|---|---|---|
| development | `sidekiq` | `config/application.rb` |
| test | `test` | `config/environments/test.rb` |
| production | `solid_queue` | `config/environments/production.rb` |

Notes:

- Development runs a `sidekiq` worker in Docker/Procfile setups.
- Production uses Solid Queue (database-backed), configured with `config/queue.yml` and `config/recurring.yml`.

## Existing Jobs and Queues

- `NotifyRestaurantNewOrderJob` (`high`)
- `NotifyCustomerOrderStatusJob` (`high`)
- `CleanupOldPendingOrdersJob` (`low`)

## Current Responsibilities

- `NotifyRestaurantNewOrderJob`
  - Loads order with associations and sends `OrderMailer.new_order_notification`
- `NotifyCustomerOrderStatusJob`
  - Sends status update email only if `customer_email` is present
- `CleanupOldPendingOrdersJob`
  - Cancels pending orders older than 2 hours

## Job Design Rules

1. Pass IDs, not full ActiveRecord objects.
2. Keep jobs idempotent and retry-safe.
3. Keep orchestration in workflows/models, not in jobs.
4. Avoid business branching explosion inside `perform`.

## Creating a New Job

```ruby
class ExampleJob < ApplicationJob
  queue_as :default

  def perform(record_id)
    record = Model.find_by(id: record_id)
    return unless record

    # idempotent work
  end
end
```

## Enqueueing

```ruby
ExampleJob.perform_later(record.id)
```

## Recurring Jobs

`config/recurring.yml` currently defines production cleanup for finished Solid Queue jobs:

- `clear_solid_queue_finished_jobs` (hourly)

## Operational Checklist

1. Choose queue priority explicitly with `queue_as`.
2. Ensure safe retries and no duplicate side effects.
3. Add tests for success and no-op edge cases.
4. If recurring, update `config/recurring.yml`.
