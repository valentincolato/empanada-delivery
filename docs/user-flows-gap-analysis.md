# User Flow Gap Analysis and Reformulation Ideas

This document reviews `docs/user-flows.md` against the current implementation (routes, controllers, UI, and tests), and proposes a cleaner flow model.

## 1. What is missing today

## 1.1 Authentication and session flows
- Logout flow is not documented (`DELETE /users/sign_out` from panel header).
- Devise password and registration routes exist but are not documented as either:
  - intentionally unsupported business flows, or
  - valid user flows.
- Missing explicit flow for unauthenticated access to admin pages (`/panel`, `/admin/*`, `/super_admin/*`) and expected redirect behavior.

## 1.2 Role-based authorization and access-denied behavior
- Missing flows for unauthorized role access:
  - non-super-admin user opening `/super_admin/restaurants` (redirect with access denied).
  - super admin trying `/admin/*` without selected restaurant context (redirect to panel or super admin restaurants).
  - API behavior for same cases (`403` JSON errors).
- Missing flow for logged-in `customer` role trying to access admin operations.

## 1.3 Public ordering edge and failure flows
- Missing 404 flow for:
  - unknown restaurant slug,
  - inactive restaurant public page,
  - unknown order token.
- Missing explicit flow for restaurant visible but not accepting orders:
  - user can still browse menu,
  - checkout request fails with `422`.
- Missing “empty cart / zero items” case:
  - backend currently allows an order with zero items (no guard for minimum 1 item).
  - this is a critical business-rule gap, not just a documentation gap.

## 1.4 Restaurant operations completeness
- Flow doc lists restaurant settings API but not a user-facing settings UI flow.
- Missing “super admin context lifecycle” flow:
  - set context (`switch_context`) is documented,
  - clear/switch context behavior is not documented as an explicit user action.
- Missing explicit flow for “cancelled orders” visibility:
  - orders can transition to `cancelled`,
  - board currently has no dedicated cancelled column.

## 1.5 Data model and process-level flows
- Missing flow for restaurant activation/deactivation impact:
  - super admin can toggle `active` on restaurant update,
  - this affects public menu availability and ordering.
- Missing flow for notification side effects:
  - placing an order enqueues `NotifyRestaurantNewOrderJob`.

## 1.6 Internationalization and naming consistency
- Documentation is in English, but part of the panel UI is still Spanish (e.g. greeting, section copy, button labels).
- User-flow docs should include language behavior expectations or explicitly state “UI language can vary by i18n locale”.

## 2. What is not fully accurate or needs reformulation

## 2.1 “Required frontend inputs” is over-stated
- `customer_email` and `customer_phone` are collected in UI, but model-level required fields are currently:
  - `customer_name`,
  - `customer_address`,
  - `payment_method`.
- Suggested reformulation:
  - “Required by UI” vs “Required by domain model” should be separate lines.

## 2.2 Payment logic section is incomplete
- Current doc explains `cash_change_for` only as optional for cash and unused for transfer.
- Domain rule is stricter: transfer + `cash_change_for` is invalid.
- Suggested reformulation:
  - include validation outcome and error behavior (`422`).

## 2.3 Order state machine is under-documented
- Current flow lists valid transitions but omits:
  - `cancelled` terminal behavior,
  - legacy `ready` status still handled in code,
  - failure path for invalid transition.

## 2.4 Test coverage section focuses on happy paths
- It does not capture significant uncovered areas:
  - unauthorized access matrix by role,
  - 404/not-found UX paths,
  - closed restaurant checkout rejection UX,
  - super admin context missing lifecycle,
  - zero-item order prevention.

## 3. Recommended flow structure (v2)

Use this layout for a reformulated flow document:

1. Actors and permissions matrix
- guest
- customer
- restaurant_admin
- super_admin

2. Public flows
- Home and discoverability
- Open menu
- Empty menu
- Closed/not-accepting menu
- Add-to-cart and checkout
- Order created
- Order tracking
- Public errors (404, validation)

3. Auth and panel entry flows
- Login success
- Login failure
- Post-login routing by role
- Logout

4. Admin operation flows
- Orders board happy path
- Invalid transition / failure path
- Product CRUD + availability
- Category CRUD + active/inactive
- QR display + download
- Restaurant settings (if/when UI exists)

5. Super admin flows
- Restaurant grid search/pagination
- Create/edit/delete restaurant
- Activate/deactivate restaurant and downstream effects
- Enter restaurant operations context
- Switch context to another restaurant
- Missing-context behavior and recovery

6. System and async flows
- Order notification job enqueueing
- Polling refresh loops (`/orders/:token`, `/admin/orders`)

7. Error catalog
- 401/403/404/422 with user-visible outcomes.

8. Coverage map
- Which flows have RSpec and Cypress coverage,
- Which are still uncovered.

## 4. Prioritized improvements (product + documentation)

## P0
- Add domain guard: reject order creation when cart has zero items.
- Document and test unauthorized access matrix (UI + API).
- Document and test closed/not-accepting checkout rejection flow end-to-end.

## P1
- Add and document cancelled-order visibility in admin board (separate column or dedicated filter).
- Define and document super-admin context switching lifecycle (set, change, clear).
- Add UI-level feedback standards for `403/404/422`.

## P2
- Normalize remaining Spanish UI copy to English for consistency with current naming policy.
- Add a “Business assumptions” section to avoid ambiguity on optional vs required fields.

## 5. Suggested next deliverables

- `docs/user-flows-v2.md`: a full replacement using the structure above.
- `docs/access-matrix.md`: explicit route/API access matrix by role.
- `docs/test-coverage-by-flow.md`: traceability matrix (flow -> spec/cypress file).
