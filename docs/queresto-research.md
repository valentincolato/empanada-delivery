# QueRestó — Domain Research

> Reference document for building the Empanada Delivery multi-tenant food ordering platform.
> QueRestó is an Argentine SaaS that gives restaurants a digital QR menu, order management, and admin panel — without per-order commissions.

---

## Core Value Proposition

- Restaurant gets a **QR code** that customers scan to see the menu
- Customers order directly from their phone (no app install needed)
- Restaurant manages orders in real time via a web panel
- No per-order commission — fixed monthly subscription
- Integrations: MercadoPago (payments), WhatsApp (notifications)

---

## Key Features

### For Restaurants
- Digital menu with categories and products (image, name, description, price)
- QR code generator pointing to the public menu URL
- Real-time order dashboard (Pending → Confirmed → Preparing → Ready → Delivered)
- Toggle "accepting orders" without taking the menu offline
- Estimated wait time setting
- Product availability toggle (can mark items as sold out)

### For Customers
- Scan QR → see full menu, organized by category
- Add items to cart (localStorage, no account needed)
- Submit order with name, phone, email, table number (optional)
- Track order status via a unique token URL
- Receive email notifications on status changes

### For Platform (Super Admin)
- Create and manage restaurants
- Provision restaurant_admin users
- View all restaurants and their status

---

## Entity Model

```
Restaurant
  - name, slug (unique, URL-safe)
  - address, phone, description
  - currency (ARS, USD, etc.)
  - active (boolean — is restaurant enabled on the platform)
  - settings: jsonb
      - accepting_orders: boolean
      - estimated_wait_minutes: integer
      - whatsapp_number: string

User (via Devise)
  - email, password (encrypted)
  - role: enum [customer, restaurant_admin, super_admin]
  - restaurant_id (FK — restaurant_admin belongs to one restaurant)

Category
  - restaurant_id
  - name
  - position (display order)
  - active

Product
  - category_id
  - name, description
  - price (decimal)
  - available (boolean — can be toggled on/off quickly)
  - position (display order)
  - image (Active Storage attachment)

Order
  - restaurant_id
  - user_id (optional — guests don't need accounts)
  - customer_name, customer_phone, customer_email
  - table_number (optional, for dine-in)
  - status: enum [pending, confirmed, preparing, ready, delivered, cancelled]
  - total_cents (integer — stored in cents to avoid floating point issues)
  - notes
  - token (UUID — unique, used for guest tracking URL)

OrderItem
  - order_id
  - product_id
  - product_name (snapshot — price can change after order is placed)
  - unit_price_cents (snapshot)
  - quantity
  - subtotal_cents
  - notes
```

---

## Key Business Flows

### 1. Customer Views Menu
```
Customer scans QR
  → GET /r/:slug (renders React shell)
  → React fetches GET /api/v1/public/menu/:slug
  → Displays categories + products
  → Cart state in localStorage (key: "cart_#{slug}")
```

### 2. Customer Places Order
```
Customer fills checkout form
  → POST /api/v1/orders { restaurant_slug, customer_info, items[] }
  → PlaceOrder workflow:
      1. Validate restaurant is active + accepting_orders
      2. BuildItemsAction validates each item (available, qty > 0)
      3. restaurant.place_order!(...)
      4. NotifyRestaurantNewOrderJob.perform_later(order.id)
  → Returns { order_token, status_url }
  → Customer gets redirected to /orders/:token
```

### 3. Restaurant Manages Orders
```
Admin opens /admin/orders (OrdersDashboard)
  → Sees kanban columns by status
  → Clicks "Confirm" → PATCH /api/v1/admin/orders/:id { status: confirmed }
  → ConfirmOrder workflow → order.confirm! → NotifyCustomerOrderStatusJob
  → Clicks "Mark Preparing" → similar flow
  → Clicks "Ready" → similar flow
```

### 4. Restaurant Manages Menu
```
Admin opens /admin/products
  → CRUD on products (name, price, description, image, availability)
  → CRUD on categories (name, position)
  → Toggle product available/unavailable instantly
```

### 5. Super Admin Creates Restaurant
```
POST /api/v1/super_admin/restaurants { restaurant_params, admin_email, admin_password }
  → CreateRestaurant workflow:
      1. Restaurant.create!(...)
      2. restaurant.provision_admin!(email:, password:)
  → Returns restaurant + admin user
```

---

## Order Status Machine

```
pending → confirmed → preparing → ready → delivered
   ↓           ↓           ↓         ↓
cancelled  cancelled  cancelled  cancelled
```

Rules:
- Only `pending` orders can have items added
- `cancelled` is terminal
- `delivered` is terminal
- Status transitions always trigger a customer notification

---

## URL Structure

| URL | Description |
|-----|-------------|
| `/r/:slug` | Public menu (QR destination) |
| `/orders/:token` | Guest order tracking |
| `/admin/orders` | Restaurant admin order dashboard |
| `/admin/products` | Restaurant admin product management |
| `/admin/categories` | Restaurant admin category management |
| `/admin/qr` | QR code download page |
| `/super_admin/restaurants` | Super admin restaurant list |

---

## API Structure

### Public
- `GET /api/v1/public/menu/:slug` — full menu data (categories + products)

### Customer-facing
- `POST /api/v1/orders` — place order
- `GET /api/v1/orders/:token` — get order status

### Restaurant Admin
- `GET/PATCH /api/v1/admin/orders` — list and update orders
- `GET/POST/PATCH/DELETE /api/v1/admin/products` — product CRUD
- `GET/POST/PATCH/DELETE /api/v1/admin/categories` — category CRUD
- `POST /api/v1/admin/restaurants/toggle_accepting_orders`
- `GET /api/v1/admin/restaurants/qr_code`

### Super Admin
- `GET/POST/PATCH/DELETE /api/v1/super_admin/restaurants`

---

## Multi-tenancy Strategy

- Single database, `restaurant_id` scoping on all tenant data
- `restaurant_admin` users are scoped to their restaurant via `current_user.restaurant`
- All admin controllers scope queries through `current_restaurant`
- Slug-based public routing (`/r/:slug`) avoids exposing integer IDs

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| `order_items.product_name` snapshot | Product names/prices change; order history must reflect original |
| `orders.token` UUID | Guests don't have accounts; token is their "receipt" |
| `restaurants.settings` JSONB | Flexible config without schema changes (estimated_wait, whatsapp, etc.) |
| `total_cents` integer | Avoids floating point precision issues with money |
| Sidekiq for async jobs | Email notifications shouldn't block order placement response |
| Devise for auth | Proven, well-maintained, supports role-based customization |
| React via Vite | Fast HMR, modern tooling; mounts via `component()` helper into Rails views |

---

## Competitive Context

QueRestó differentiates from iFood/Rappi/PedidosYa by:
1. No delivery logistics — restaurants handle their own fulfillment
2. No per-order commission
3. QR-first (no app needed for customers)
4. White-label per restaurant
5. Simpler setup (minutes, not days)

Our platform (Empanada Delivery) follows the same model but built as an open-source/self-hosted alternative.
