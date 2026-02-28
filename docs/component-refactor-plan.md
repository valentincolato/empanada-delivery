# Component Refactor Plan

## Goal
Reduce frontend complexity by eliminating oversized React components and splitting responsibilities into focused modules without changing behavior.

## Current Problems

1. Oversized components with mixed concerns.
- `app/javascript/components/Menu.jsx` (~519 lines): data fetching, cart state, checkout state, modal orchestration, and view rendering in one file.
- `app/javascript/components/super_admin/RestaurantsManager.jsx` (~302 lines): search, pagination, CRUD, modal form, context switching, and rendering in one file.
- `app/javascript/components/Home.jsx` (~224 lines): many sections in one large render tree.

2. Tight coupling between API calls and presentation.
- Components execute API calls inline, making testing and reuse harder.

3. Repeated UI patterns without dedicated shared components.
- Cards, modals, status badges, and table actions repeat with slight differences.

4. Weak boundaries for domain logic in UI.
- Business rules (status transitions, role behavior, confirmation flows) are embedded directly in page components.

## Refactor Principles

1. One component = one responsibility.
2. Page components orchestrate; child components render.
3. Data loading and mutations live in hooks/services, not in presentation components.
4. Keep behavior unchanged; refactor incrementally with tests.
5. Prefer composition over condition-heavy monolith components.

## Target Structure

- `components/pages/*` for route-root pages.
- `components/sections/*` for page blocks.
- `components/ui/*` for reusable primitives.
- `hooks/*` for state/data orchestration.
- `services/*` (or `utils/api/*`) for request wrappers.

Suggested caps:
- Page component: <= 180 lines.
- Section/component: <= 120 lines.
- Hook: <= 150 lines.

## Step-by-Step Plan

### Phase 1: Menu page decomposition (highest priority)

Split `Menu.jsx` into:
- `components/pages/MenuPage.jsx` (root orchestration only)
- `components/menu/MenuHeader.jsx`
- `components/menu/MenuCategories.jsx`
- `components/menu/ProductCard.jsx`
- `components/menu/CartDrawer.jsx`
- `components/menu/CheckoutModal.jsx`
- `components/menu/ProductDetailModal.jsx`
- `hooks/useMenuData.js` (fetch menu + derived data)
- `hooks/useCartState.js` (cart actions + totals)

Acceptance criteria:
- Same user flow for browse/add/remove/checkout.
- Existing Cypress menu/order tests pass.
- `MenuPage.jsx` under 180 lines.

### Phase 2: Super admin restaurants decomposition

Split `RestaurantsManager.jsx` into:
- `components/pages/SuperAdminRestaurantsPage.jsx`
- `components/restaurants/RestaurantsToolbar.jsx`
- `components/restaurants/RestaurantsGrid.jsx`
- `components/restaurants/RestaurantCard.jsx`
- `components/restaurants/RestaurantFormModal.jsx`
- `hooks/useRestaurantDirectory.js` (load, filter, paginate, mutations)

Acceptance criteria:
- Search/pagination/create/edit/delete/context switch unchanged.
- Existing Cypress super admin flows pass.

### Phase 3: Home page section extraction

Split `Home.jsx` into section components:
- `components/home/HeroSection.jsx`
- `components/home/FeaturesSection.jsx`
- `components/home/BenefitsSection.jsx`
- `components/home/FaqSection.jsx`
- `components/home/CtaSection.jsx`

Acceptance criteria:
- Visual output unchanged.
- `Home.jsx` becomes section composition only.

### Phase 4: Shared UI primitives and behavior cleanup

Create reusable primitives:
- `ui/Card.jsx`, `ui/SectionTitle.jsx`, `ui/StatusBadge.jsx`, `ui/ConfirmButton.jsx`, `ui/ModalShell.jsx`

Replace scattered `alert/confirm` calls with centralized feedback helpers:
- `utils/confirmAction.js`
- `utils/notify.js`

Acceptance criteria:
- No direct browser `alert()`/`confirm()` in page components.
- Reused patterns move to `ui/*`.

## Risk Mitigation

1. Keep each phase in separate PRs/commits.
2. Run build + targeted tests after each phase.
3. Avoid schema/domain changes while refactoring UI structure.
4. Maintain prop contracts for mounted Rails components.

## Validation Checklist per Phase

- `npm run build`
- Relevant RSpec request/model specs
- Relevant Cypress spec(s) for touched flows
- Manual smoke test:
  - public menu
  - admin orders/products/categories/members
  - super admin restaurants

## Initial Task Breakdown (next execution)

1. Create `hooks/useMenuData.js` and `hooks/useCartState.js`.
2. Extract `CartDrawer`, `CheckoutModal`, `ProductDetailModal` from `Menu.jsx`.
3. Replace inline logic in `Menu.jsx` with hook usage.
4. Run `npm run build` and menu-related Cypress tests.
