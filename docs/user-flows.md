# User Flows

## Actors

| Actor | Description |
|---|---|
| **Guest** | No session, no account |
| **Customer** | Devise user with `customer` role, no admin access |
| **Restaurant Admin** | Devise `restaurant_admin`, manages one own restaurant |
| **Super Admin (no ctx)** | Devise `super_admin`, no restaurant selected in session |
| **Super Admin (with ctx)** | Devise `super_admin`, `session[:admin_restaurant_id]` set |

---

## Public flows (Guest / Customer)

### UC-01 · Home (`/` and `/home`)
- View landing page.
- Go to demo menu (`/empanadas-demo`).
- Go to admin login (`/panel/login`).

### UC-02 · View restaurant menu (`/r/:slug`, `/menu/:slug`, `/:restaurant_name`)
- **Happy path**: active restaurant → shows name, open/closed status, active categories, and available products.
- **Error**: slug not found or inactive restaurant → `public/404.html` (HTTP 404).
- **Edge**: active restaurant with `accepting_orders: false` → menu is still visible, checkout fails (UC-05).

### UC-03 · Open product modal
- Click `+ Add` on a product.
- View: title, price, image (optional), description (optional).
- Set quantity → add to cart.

### UC-04 · Manage cart
- Increment/decrement quantities per item in the cart drawer.
- When all quantities reach 0: drawer closes and checkout resets.
- Cart persists in `localStorage` keyed by restaurant slug.

### UC-05 · Checkout and place order (`POST /api/v1/orders`)
- **Required by UI**: name, phone, email, address, payment method.
- **Required by domain model**: name, address, payment method (phone and email are optional at the model level).
- **Optional (API)**: notes, `cash_change_for`.
- **Payment rules**:
  - `cash`: `cash_change_for` is optional.
  - `transfer`: `cash_change_for` must be blank (domain validation).
- **Domain validations**:
  - Restaurant must be active and `accepting_orders: true`.
  - All products must be available (BuildItemsAction).
  - Each item quantity must be greater than 0.
  - Cart must contain at least one item (backend guard in PlaceOrder).
- **Happy path**: order created with `pending` status → redirect to `/orders/:token`.
- **Errors**:
  - Restaurant not found or inactive → 404.
  - Restaurant not accepting orders → 422.
  - Payment rule violation → 422.
  - Product unavailable → 422.

### UC-06 · Track order (`/orders/:token`)
- Data via `GET /api/v1/orders/:token`.
- Shows: restaurant name, order id, status badge, progress bar, items, total, address, payment method.
- Auto-refresh every 15 seconds.
- Progress bar steps: `pending → confirmed → out_for_delivery → delivered`.
- `cancelled`: red badge, no progress bar.
- `ready` (legacy): has icon but is not included in the progress bar steps.
- **Error**: token not found → inline error message in React (not a Rails 404 page).

---

## Auth and session flows

### UC-07 · Login (`/panel/login`, `/users/sign_in`)
- **Happy path**: valid credentials → redirect to `/panel`.
- **Error**: invalid credentials → Devise error on the form.

### UC-08 · Logout
- "Sign out" button in panel header → `DELETE /users/sign_out`.
- Redirects to `/users/sign_in`.

### UC-09 · Devise routes without a defined product flow
- `GET /users/sign_up` — public registration (likely unintentional).
- `GET /users/password/new` — forgot password.
- `GET /users/edit` — edit account.
- These routes exist but no UI or business flow is defined for them.

### UC-10 · Unauthenticated access to protected routes
- `/panel`, `/admin/*`, `/super_admin/*` → `authenticate_user!` → redirect to `/users/sign_in`.

---

## Panel entry (`/panel`) — by role

### UC-11 · Panel — restaurant_admin
- Tiles: Orders, Products, Categories, QR.
- Public access section: link to the restaurant public menu (if slug is present).

### UC-12 · Panel — super_admin
- Section: access to `/super_admin/restaurants`.

### UC-13 · Panel — customer (or any role without admin access)
- Shows "no administrative access" banner.
- Cannot navigate to any operational section.

---

## Restaurant operations (restaurant_admin and super_admin with ctx)

### UC-14 · Orders dashboard (`/admin/orders`)
- Kanban board by status: Pending / Confirmed / Out for delivery / Delivered / Cancelled.
- Per card: view customer data, payment details, items, notes; transition status.
- Valid transitions:
  ```
  pending         → confirmed | cancelled
  confirmed       → out_for_delivery | cancelled
  out_for_delivery → delivered | cancelled
  ready           → delivered | cancelled  (legacy, not visible in UI)
  delivered       → (terminal)
  cancelled       → (terminal)
  ```
- **Invalid transition error**: 422 with error message.
- **Super admin without context trying this route**: redirect to `/panel` with alert.

### UC-15 · Product management (`/admin/products`)
- Create product: name, description, price, category, position.
- Edit product.
- Delete product.
- Toggle availability (available / unavailable) — affects visibility in the public menu.

### UC-16 · Category management (`/admin/categories`)
- Create category: name, position.
- Edit category.
- Delete category.
- Toggle active/inactive — inactive category is hidden from the public menu.

### UC-17 · Restaurant QR (`/admin/qr`)
- View QR SVG pointing to the public menu URL.
- Download SVG.

### UC-18 · Restaurant settings
- `GET /api/v1/admin/restaurant` — view settings.
- `PATCH /api/v1/admin/restaurant` — update settings.
- `POST /api/v1/admin/restaurant/toggle_accepting_orders` — open/close order intake.
- Toggle button in the orders dashboard header shows current state and allows switching.

---

## Super admin flows

### UC-19 · Restaurant listing (`/super_admin/restaurants`)
- Paginated grid.
- Search by name / slug / phone / currency.
- Metrics: total, active, inactive.

### UC-20 · Create restaurant
- Fields: name, slug, address, phone, description, currency (default: ARS).
- Admin credentials: email (required), password (required), name (optional).
- **Side effect**: `CreateRestaurant` workflow creates the restaurant and provisions a `restaurant_admin` user.
- **Error**: invalid data → 422.

### UC-21 · Edit restaurant
- Same fields as create, plus `active` boolean.
- Deactivating a restaurant makes its public menu return 404 and blocks new orders.

### UC-22 · Delete restaurant
- `DELETE /api/v1/super_admin/restaurants/:id`.
- Hard delete; no server-side confirmation step.

### UC-23 · Enter restaurant operations (switch context)
- Click "Manage operations" on a restaurant card.
- `POST /api/v1/super_admin/restaurants/:id/switch_context` → sets `session[:admin_restaurant_id]`.
- Redirect to `/admin/orders`.
- Context persists for the duration of the session.
- Switching to another restaurant overwrites the current context.
- "← Restaurants" button in the orders dashboard header calls `DELETE /api/v1/super_admin/restaurants/clear_context` and redirects to `/super_admin/restaurants`.

### UC-24 · Super admin without context tries admin routes
- `GET /admin/*` → `require_admin_access!` → redirect to `/panel` with alert.
- `require_current_restaurant!` → redirect to `/super_admin/restaurants` with alert.
- `API /api/v1/admin/*` → 403 `{ error: "Forbidden" }` or `{ error: "Restaurant context not found" }`.

---

## System and background flows

### UC-25 · New order notification job
- Triggered by `PlaceOrder` workflow after order creation.
- `NotifyRestaurantNewOrderJob.perform_later(order.id)` → Sidekiq default queue.

### UC-26 · Order status polling
- `OrderStatus` component: `setInterval` every 15 s calling `GET /api/v1/orders/:token`.

### UC-27 · Admin orders dashboard polling
- `OrdersDashboard` component reloads orders on tab change or after a status transition.

---

## Access matrix

| Route / Action | Guest | Customer | Restaurant Admin | SA no ctx | SA with ctx |
|---|:---:|:---:|:---:|:---:|:---:|
| `/` Home | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/r/:slug` Menu | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/orders` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/orders/:token` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/panel` | → login | ✅ warning | ✅ | ✅ | ✅ |
| `/admin/*` | → login | → login | ✅ | → panel | ✅ |
| `/super_admin/*` | → login | → login | → login | ✅ | ✅ |
| `API /api/v1/admin/*` | 401 | 401 | ✅ | 403 | ✅ |
| `API /api/v1/super_admin/*` | 401 | 401 | 403 | ✅ | ✅ |

---

## Known gaps

All previously identified gaps (G1–G8) have been resolved.
