# Empanada Delivery

Multi-tenant food ordering platform — scan a QR, browse the menu, place an order. Restaurants manage everything from a real-time dashboard.

Built with **Ruby on Rails 8 + React (Vite) + PostgreSQL + Active Job queues**.

---

## Features

- **QR menu** — customers scan a code and get a mobile-friendly menu, no app install needed
- **Cart + checkout** — add items, submit name/table/phone, get a tracking link
- **Order tracking** — live status page via unique token URL (auto-refreshes)
- **Admin kanban** — restaurant staff move orders through Pending → Confirmed → Preparing → Ready
- **Product management** — CRUD products and categories, toggle availability instantly
- **QR code generator** — SVG download for printing
- **Multi-tenancy** — one platform, multiple restaurants, each scoped by slug
- **Background jobs** — email notifications via Active Job (`Sidekiq` in development, `Solid Queue` in production)
- **Super admin** — create and manage restaurants + provision admin users

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Ruby 3.2 · Rails 8.1 |
| Database | PostgreSQL 16 |
| Background jobs | Active Job (`Sidekiq` in development, `Solid Queue` in production) |
| Frontend | React 18 + Vite (auto-mounted via `component()` helper) |
| Auth | Devise (roles: `customer`, `restaurant_admin`, `super_admin`) |
| Serialization | Blueprinter |
| QR codes | rqrcode |
| Tests | RSpec + FactoryBot + Shoulda Matchers |

---

## Project Structure

```
app/
├── actions/          # Focused commands with success/failure result (BaseAction)
│   ├── orders/
│   ├── products/
│   └── restaurants/
├── workflows/        # Coordinate multiple aggregates or external systems
├── blueprints/       # Blueprinter serializers
├── controllers/
│   ├── api/v1/
│   │   ├── public/   # No auth required
│   │   ├── admin/    # restaurant_admin role
│   │   └── super_admin/
├── javascript/
│   ├── components/
│   │   ├── admin/
│   │   └── super_admin/
│   └── utils/        # api.js · cart.js · mountAllComponents.js
├── jobs/
├── mailers/
├── models/           # Aggregates live here (Restaurant, Order)
└── workflows/
```

---

## Getting Started

### Option A — Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Compose plugin.

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd empanada-delivery

# 2. Copy the env template (edit if needed)
cp .env.example .env.local

# 3. Start all services (postgres, redis, rails, vite, sidekiq)
docker compose up

# 4. In a second terminal — run migrations and seed demo data
docker compose run --rm web rails db:migrate
docker compose run --rm web rails db:seed
```

Services started by `docker compose up`:

| Service | URL | Description |
|---|---|---|
| `web` | http://localhost:3000 | Rails application |
| `vite` | http://localhost:3036 | Vite HMR server |
| `postgres` | localhost:5432 | PostgreSQL 16 |
| `redis` | localhost:6379 | Redis 7 |
| `sidekiq` | — | Background job worker |

---

### Option B — Local (without Docker)

**Prerequisites:** Ruby 3.2, Node 22, PostgreSQL, Redis.

```bash
# 1. Install dependencies
bundle install
npm install

# 2. Create and migrate the database
rails db:create db:migrate

# 3. Seed demo data
rails db:seed

# 4. Start all processes (Foreman reads Procfile.dev)
bin/dev
```

This starts Rails on port 3000 and Vite on port 3036 concurrently.

---

## Demo Credentials

After running `db:seed`:

| Role | Email | Password |
|---|---|---|
| Super admin | admin@empanada.dev | password123 |
| Restaurant admin | demo@empanada.dev | password123 |

---

## Key URLs

| URL | Description |
|---|---|
| `/r/empanadas-demo` | Public menu (QR destination) |
| `/orders/:token` | Order tracking for customers |
| `/admin/orders` | Restaurant admin — order kanban |
| `/admin/products` | Restaurant admin — product CRUD |
| `/admin/categories` | Restaurant admin — category CRUD |
| `/admin/qr` | QR code download |
| `/super_admin/restaurants` | Super admin — restaurant management |

---

## API Overview

### Public (no auth)
```
GET  /api/v1/public/menu/:slug    # Full menu: categories + available products
POST /api/v1/orders               # Place an order
GET  /api/v1/orders/:token        # Get order status
```

### Restaurant Admin
```
GET    /api/v1/admin/orders
PATCH  /api/v1/admin/orders/:id           # Update status
GET/POST/PATCH/DELETE /api/v1/admin/products
GET/POST/PATCH/DELETE /api/v1/admin/categories
POST   /api/v1/admin/restaurant/toggle_accepting_orders
GET    /api/v1/admin/restaurant/qr_code
```

### Super Admin
```
GET/POST/PATCH/DELETE /api/v1/super_admin/restaurants
```

---

## Architecture

Business logic follows a layered pattern:

- **Aggregates** — consistency logic lives on the model root (`Restaurant#place_order!`, `Order#confirm!`)
- **Workflows** — coordinate multiple aggregates or side effects (`PlaceOrder`, `CreateRestaurant`)
- **Actions** — focused commands with typed results (`Orders::BuildItemsAction`)
- **Controllers / Jobs** — thin entry points that delegate immediately

See `docs/guidelines/TARGET_ARCHITECTURE.md` for the full decision guide.

---

## Running Tests

### RSpec (unit + integration)

```bash
# Full suite
bundle exec rspec

# With Docker
docker compose run --rm web bundle exec rspec

# Single file
bundle exec rspec spec/models/restaurant_spec.rb
```

### Cypress (E2E)

Requires the Rails server and seed data to be running.

```bash
# 1. Start the server (in one terminal)
rails server        # or: docker compose up web

# 2a. Open Cypress interactive runner (great for development)
npm run cy:open

# 2b. Run headless (CI mode, starts server automatically)
npm run cy:ci
```

**Test files:**

| File | What it covers |
|---|---|
| `cypress/e2e/menu.cy.js` | Public menu, categories, cart add/remove, checkout modal |
| `cypress/e2e/order.cy.js` | Full order placement flow, status page, error handling |
| `cypress/e2e/admin/orders.cy.js` | Kanban board, status transitions (Pending → Confirmed → … → Ready), cancel |
| `cypress/e2e/admin/products.cy.js` | Create, edit, toggle availability, cancel modal |

Screenshots on failure are saved to `cypress/screenshots/` (gitignored, uploaded as CI artifact).

---

## Linting

```bash
bundle exec rubocop          # check
bundle exec rubocop -a       # auto-fix
```

---

## Useful Docker Commands

```bash
# Open a Rails console
docker compose run --rm web rails console

# Run a specific migration
docker compose run --rm web rails db:migrate

# Reset the database
docker compose run --rm web rails db:drop db:create db:migrate db:seed

# Tail logs
docker compose logs -f web
docker compose logs -f sidekiq

# Rebuild after changing Gemfile or package.json
docker compose build
```

---

## Deployment

The project is configured for [Render.com](https://render.com) free tier via `render.yaml`:

- **Web service** — Rails + Puma
- **Worker** — Sidekiq
- **PostgreSQL** and **Redis** managed services

To deploy:
1. Push to GitHub
2. Connect the repo in Render and it picks up `render.yaml` automatically
3. Set the `RAILS_MASTER_KEY` secret in Render's environment settings

CI runs on every pull request (RSpec + RuboCop) and deploys automatically on push to `main` via the `RENDER_DEPLOY_HOOK_URL` secret.

---

## Domain Research

See `docs/queresto-research.md` for the product analysis that informed this project's design (features, entity model, business flows, competitive context).
