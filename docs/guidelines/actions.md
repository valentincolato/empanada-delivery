# Actions Guide

This project uses `BaseAction` for focused command-style operations with explicit success/failure results.

Location: `app/actions/`

## Base Contract

All actions inherit from `BaseAction` and use:

- `self.call(**kwargs)` as the entry point
- `ActiveModel::Validations` for input validation
- `success!(value)` for successful results
- `fail!(value)` for early failure
- a `Result` object with:
  - `success?`
  - `failure?`
  - `value`

## Recommended Structure

```ruby
module Namespace
  class ExampleAction < BaseAction
    attr_accessor :record, :payload

    validates_presence_of :record, :payload

    def perform
      # 1) Validate domain assumptions
      # 2) Execute a focused operation
      # 3) Return a uniform result
      success!(result)
    end
  end
end
```

## When to Use an Action

Use an action when:

1. The operation is focused business logic (roughly 15-80 lines)
2. Callers need a consistent success/failure response
3. There are multiple validation or failure points

Real examples in this codebase:

- `Orders::BuildItemsAction`
  - validates product availability and quantities
  - transforms cart payload into order item snapshots
- `Products::ToggleAvailabilityAction`
  - toggles product `available` state
- `Restaurants::GenerateQrAction`
  - generates QR SVG and menu URL for `/r/:slug`

## When Not to Use an Action

- Multi-step orchestration across aggregates/jobs/external effects: use `app/workflows/`
- Aggregate consistency rules: keep on the aggregate root model
- Third-party communication: isolate in a client/adapter

## Implementation Rules

1. Keep `perform` short and linear.
2. Split into private step methods when flow grows.
3. Do not use controller concerns (`params`, render/redirect).
4. Return useful error values for API/workflow handling.
5. Let workflows or aggregate methods own surrounding transactions.

## Relationship with Workflows

In this project:

- Workflow = orchestration
- Action = focused business command

Example: `PlaceOrder` uses `Orders::BuildItemsAction` before calling `restaurant.place_order!`.

## Testing Expectations

- Unit tests per action in `spec/actions/**`
- Cover:
  - happy path
  - input validation
  - business failures (`fail!`)

## Quick Checklist

- Inherits from `BaseAction`
- Inputs declared via `attr_accessor`
- Validations declared
- Uses `success!`/`fail!` (no ad-hoc return hashes)
- No controller/view coupling
