# Pedido Facil

Multi-tenant food ordering platform for restaurants.
Customers scan a QR code, place orders from their phone, and track order status. Restaurant teams manage operations from an admin panel.

## What This Project Is

`Pedido Facil` helps small and medium restaurants run digital ordering without building separate apps.

It combines:
- A public mobile ordering flow (`/:slug`)
- A restaurant operations dashboard (`/admin/*`)
- A super admin area to manage tenants (`/super_admin/*`)

## Main Product Flows

1. Customer scans a QR code.
2. Customer browses menu and adds products to cart.
3. Customer places an order with contact/table details.
4. Kitchen/admin team updates status (`pending -> confirmed -> preparing -> ready` or `cancelled`).
5. Customer checks a tokenized tracking page (`/orders/:token`).

## Feature Summary

### Public / Customer
- QR-driven menu by restaurant slug.
- Category/product listing with availability.
- Cart and checkout.
- Order tracking with secure token URL.

### Restaurant Admin
- Orders board and status transitions.
- Product CRUD and availability toggle.
- Category CRUD.
- Restaurant settings and QR code generation.
- Team membership management.

### Super Admin
- Create and manage restaurants.
- Switch context into restaurant operations.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Ruby `3.2` + Rails `8.1.1` |
| Frontend | React `19` + Vite `6` |
| Database | PostgreSQL `16` |
| Cache / jobs infra | Redis `7` |
| Auth / authorization | Devise + Pundit |
| Serialization | Blueprinter |
| Background jobs | Active Job + Sidekiq |
| Testing | RSpec + FactoryBot + Shoulda Matchers + Cypress |

## Repository Structure

```text
app/
├── actions/            # Command-style business operations
├── workflows/          # Multi-step use cases orchestration
├── models/             # Core domain entities (Restaurant, Order, etc.)
├── blueprints/         # JSON serializers (Blueprinter)
├── policies/           # Pundit policies
├── controllers/
│   ├── api/v1/public/
│   ├── api/v1/admin/
│   └── api/v1/super_admin/
└── javascript/
    ├── components/     # React UI by area (home/menu/admin/super_admin)
    └── utils/

docs/
├── user-flows.md
└── guidelines/
```

## Getting Started

### Option A: Docker (recommended)

Prerequisite: Docker Engine/Desktop + Compose plugin.

```bash
git clone <repo-url>
cd pedido-facil
cp .env.example .env.local

docker compose up
```

Services started by `docker compose up`:

| Service | URL / Port | Description |
|---|---|---|
| `web` | http://localhost:3000 | Rails app |
| `vite` | http://localhost:3036 | Vite dev server (HMR) |
| `postgres` | localhost:5433 | PostgreSQL |
| `redis` | localhost:6379 | Redis |
| `sidekiq` | n/a | Background worker |

Useful commands:

```bash
# Migrate and seed
docker compose run --rm web rails db:migrate
docker compose run --rm web rails db:seed

# Rails console
docker compose run --rm web rails console

# Rebuild images
docker compose build
```

### Option B: Local (without Docker)

Prerequisites:
- Ruby `3.2.x`
- Node `22.x`
- PostgreSQL
- Redis

```bash
bundle install
npm install

rails db:create db:migrate
rails db:seed

# Starts Rails + Vite (Procfile.dev)
bin/dev
```

Note: `bin/dev` starts Rails and Vite. If you need async job processing locally, run Sidekiq in a second terminal:

```bash
bundle exec sidekiq -q high -q default -q low
```

## Demo Data and Credentials

After `rails db:seed`:

| Role | Email | Password |
|---|---|---|
| Restaurant admin | `demo@empanada.dev` | `password123` |
| Pizza admin | `pizza@pedidofacil.dev` | `password123` |
| Multi-restaurant member | `multi@pedidofacil.dev` | `password123` |

Super admin is optional and only created if seed ENV vars are set:

```bash
SEED_SUPER_ADMIN_EMAIL=admin@empanada.dev \
SEED_SUPER_ADMIN_PASSWORD=password123 \
rails db:seed
```

## Key Routes

| Route | Purpose |
|---|---|
| `/` or `/home` | Landing page |
| `/:slug` | Public menu by restaurant |
| `/orders/:token` | Customer order status |
| `/panel/login` | Staff login |
| `/panel` | Role-based panel landing |
| `/admin/orders` | Restaurant operations board |
| `/admin/products` | Product management |
| `/admin/categories` | Category management |
| `/admin/qr` | QR generation/download |
| `/admin/members` | Team members management |
| `/super_admin/restaurants` | Tenant management |

## API Overview

### Public
```http
GET  /api/v1/public/menu/:slug
POST /api/v1/orders
GET  /api/v1/orders/:token
```

### Restaurant Admin
```http
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/:id
PATCH  /api/v1/admin/orders/:id

GET/POST/PATCH/DELETE /api/v1/admin/products
GET/POST/PATCH/DELETE /api/v1/admin/categories

GET    /api/v1/admin/memberships
POST   /api/v1/admin/memberships
DELETE /api/v1/admin/memberships/:id

POST   /api/v1/admin/switch_restaurant
DELETE /api/v1/admin/clear_restaurant

GET    /api/v1/admin/restaurant
PATCH  /api/v1/admin/restaurant
POST   /api/v1/admin/restaurant/toggle_accepting_orders
GET    /api/v1/admin/restaurant/qr_code
```

### Super Admin
```http
GET/POST/PATCH/DELETE /api/v1/super_admin/restaurants
POST   /api/v1/super_admin/restaurants/:id/switch_context
DELETE /api/v1/super_admin/restaurants/clear_context
```

## Testing

### Backend (RSpec + RuboCop)

```bash
bundle exec rspec
bundle exec rubocop --parallel
```

### E2E (Cypress)

```bash
npm run cy:open
npm run cy:run
npm run cy:ci
```

Current Cypress specs:
- `cypress/e2e/menu.cy.js`
- `cypress/e2e/order.cy.js`
- `cypress/e2e/admin/panel.cy.js`
- `cypress/e2e/admin/orders.cy.js`
- `cypress/e2e/admin/products.cy.js`

## Deployment

The repository includes `render.yaml` and a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs RSpec + RuboCop
- Runs Cypress
- Triggers Render deploy on push to `main` (requires `RENDER_DEPLOY_HOOK_URL` secret)

## Additional Documentation

- `docs/user-flows.md`
- `docs/user-flows-gap-analysis.md`
- `docs/component-refactor-plan.md`
- `docs/guidelines/TARGET_ARCHITECTURE.md`
