# Target Architecture Guide

This document defines where business logic should live in Empanada Delivery.

## Architectural Units

## 1. Aggregates (Model Roots)

Aggregate roots own consistency and invariants for their internal data.

Current aggregate roots:

- `Restaurant`
- `Order`

Examples in code:

- `Restaurant#place_order!`
- `Restaurant#toggle_accepting_orders!`
- `Restaurant#provision_admin!`
- `Order#add_items!`
- `Order#update_status!`
- `Order#can_transition_to?`

Rule:

- If a rule only affects one aggregate, keep it on the model root.

## 2. Workflows (Cross-Aggregate Orchestration)

Workflows coordinate multiple steps, including actions/jobs.

Location: `app/workflows/`

Current workflows:

- `PlaceOrder`
- `UpdateOrderStatus`
- `CreateRestaurant`
- `ConfirmOrder`
- `CancelOrder`

Rule:

- If logic coordinates multiple operations or side effects, use a workflow.

## 3. Actions (Focused Commands)

Actions encapsulate small, reusable business operations with explicit success/failure.

Location: `app/actions/`

Examples:

- `Orders::BuildItemsAction`
- `Products::ToggleAvailabilityAction`
- `Restaurants::GenerateQrAction`

Rule:

- Use actions for focused commands, not full process orchestration.

## 4. Entry Points (Controllers / Jobs)

Controllers and jobs are delivery mechanisms. Keep them thin.

They should:

- parse/validate request shape
- authorize and scope tenant context
- delegate quickly to workflow/action/model methods

They should not:

- contain long business decision trees
- duplicate aggregate transition rules

## 5. API Serialization

Use Blueprinter serializers in `app/blueprints/` to keep response shapes centralized.

Examples:

- `OrderBlueprint`
- `ProductBlueprint`
- `RestaurantBlueprint`

## 6. Frontend Boundary

Rails views host mount points; React components own interactive UI state.

- Rails: route + shell rendering
- React: data fetching, state, interactions

## Decision Tree

When adding new logic:

1. One aggregate invariant only? -> model root method
2. Focused command with explicit result? -> action
3. Multi-step coordination with side effects? -> workflow
4. HTTP/auth/tenant boundary only? -> controller
5. Async delivery concern? -> job

## Naming Rules

Prefer business-event names:

- `PlaceOrder`
- `UpdateOrderStatus`
- `CreateRestaurant`

Avoid generic names:

- `OrderService`
- `RestaurantManager`
- `HandleOrder`

## Testing Expectations

- Aggregates: model specs for invariants and transitions
- Actions: unit specs for success/failure paths
- Workflows: behavior specs for orchestration + side effects
- Controllers: request specs focused on auth/scoping/contracts
- Jobs: job specs for idempotent behavior

## Architecture Smells

- Controller updates status transitions directly with duplicated logic
- Workflow doing raw SQL or rendering JSON
- Action that mixes HTTP calls, persistence, and mail delivery all together
- Model callbacks hiding complex orchestration across aggregates
