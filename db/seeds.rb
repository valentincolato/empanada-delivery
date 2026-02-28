# Optional super admin (recommended for production via ENV)
previous_queue_adapter = ActiveJob::Base.queue_adapter
ActiveJob::Base.queue_adapter = :inline

begin
if ENV["SEED_SUPER_ADMIN_EMAIL"].present?
  super_admin = User.find_or_create_by!(email: ENV.fetch("SEED_SUPER_ADMIN_EMAIL")) do |u|
    u.password = ENV.fetch("SEED_SUPER_ADMIN_PASSWORD")
    u.name = ENV.fetch("SEED_SUPER_ADMIN_NAME", "Super Admin")
    u.role = :super_admin
  end
  puts "Super admin: #{super_admin.email}"
else
  puts "Super admin: not seeded (set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create one)"
end

# Idempotent helper for demo restaurants
def ensure_restaurant!(name:, slug:, address:, phone:, description:, currency:, settings:, admin_email:, admin_password:, admin_name:)
  restaurant = Restaurant.find_or_initialize_by(slug: slug)
  restaurant.assign_attributes(
    name: name,
    address: address,
    phone: phone,
    description: description,
    currency: currency,
    settings: settings,
    active: true
  )
  restaurant.save!

  admin = restaurant.provision_admin!(
    email: admin_email,
    password: admin_password,
    name: admin_name
  )

  { restaurant: restaurant, admin: admin }
end

# Main demo restaurant (empanadas)
result = ensure_restaurant!(
  name: "Empanadas Demo",
  slug: "empanadas-demo",
  address: "Av. Corrientes 1234, CABA",
  phone: "+54 11 1234-5678",
  description: "Las mejores empanadas artesanales de Buenos Aires 🫔",
  currency: "ARS",
  settings: { "accepting_orders" => true, "estimated_wait_minutes" => 20 },
  admin_email: "demo@empanada.dev",
  admin_password: "password123",
  admin_name: "Demo Admin"
)

restaurant = result[:restaurant]
puts "Restaurant: #{restaurant.name} (#{restaurant.slug})"
puts "Admin: #{result[:admin].email}"

# Categories
clasicas = restaurant.categories.find_or_create_by!(name: "Empanadas Clásicas") { |c| c.position = 1 }
especiales = restaurant.categories.find_or_create_by!(name: "Empanadas Especiales") { |c| c.position = 2 }
bebidas = restaurant.categories.find_or_create_by!(name: "Bebidas") { |c| c.position = 3 }
postres = restaurant.categories.find_or_create_by!(name: "Postres") { |c| c.position = 4 }

# Attach seed images helper
def attach_seed_image(product, filename)
  path = Rails.root.join("db", "seed_images", filename)
  return unless File.exist?(path)
  if product.image.attached?
    return if product.image.filename.to_s == filename
    product.image.purge
  end

  product.image.attach(
    io: File.open(path),
    filename: filename,
    content_type: "image/jpeg"
  )
end

# Products                                                                                      image file
[
  [ clasicas,   "Carne Picante",      "Relleno de carne vacuna con especias picantes",    850.00, 1, "empanada_carne.jpg"    ],
  [ clasicas,   "Carne Suave",        "Relleno de carne vacuna con especias suaves",      850.00, 2, "empanada_carne.jpg"    ],
  [ clasicas,   "Jamón y Queso",      "Jamón cocido y queso cremoso",                     800.00, 3, "empanada_horno.jpg"    ],
  [ clasicas,   "Choclo",             "Choclo cremoso con queso",                         750.00, 4, "empanada_horno.jpg"    ],
  [ clasicas,   "Humita",             "Humita tradicional con leche",                     750.00, 5, "empanada_horno.jpg"    ],
  [ especiales, "Pollo al Curry",     "Pollo desmenuzado con curry y vegetales",          950.00, 1, "pollo_curry.jpg"       ],
  [ especiales, "Caprese",            "Tomate, mozzarella y albahaca fresca",             900.00, 2, "caprese.jpg"           ],
  [ especiales, "Roquefort y Nuez",   "Queso roquefort con nueces tostadas",             1000.00, 3, "empanada_horno.jpg"   ],
  [ bebidas,    "Agua Mineral",       "500ml",                                            350.00, 1, "agua_mineral.jpg"      ],
  [ bebidas,    "Gaseosa",            "Coca-Cola, Sprite o Fanta 500ml",                  450.00, 2, "gaseosa.jpg"           ],
  [ bebidas,    "Limonada Natural",   "Preparada al momento",                             600.00, 3, "limonada.jpg"          ],
  [ postres,    "Alfajor de Maicena", "Relleno de dulce de leche, cubierto con azúcar",   500.00, 1, "alfajor.jpg"           ],
  [ postres,    "Brownie",            "Con helado de crema americana",                    750.00, 2, "brownie.jpg"           ],
].each do |category, name, description, price, position, image_file|
  product = category.products.find_or_create_by!(name: name) do |p|
    p.description = description
    p.price = price
    p.position = position
    p.available = true
  end
  attach_seed_image(product, image_file)
end

# Secondary demo restaurant (pizzas)
pizza_result = ensure_restaurant!(
  name: "Pizzería Demo",
  slug: "pizzas-demo",
  address: "Av. Santa Fe 2500, CABA",
  phone: "+54 11 4321-7890",
  description: "Pizzas al horno de piedra, focaccias y postres caseros.",
  currency: "ARS",
  settings: { "accepting_orders" => true, "estimated_wait_minutes" => 30 },
  admin_email: "pizza@pedidofacil.dev",
  admin_password: "password123",
  admin_name: "Pizza Admin"
)

pizza_restaurant = pizza_result[:restaurant]
puts "Restaurant: #{pizza_restaurant.name} (#{pizza_restaurant.slug})"
puts "Admin: #{pizza_result[:admin].email}"

pizzas = pizza_restaurant.categories.find_or_create_by!(name: "Pizzas") { |c| c.position = 1 }
promos = pizza_restaurant.categories.find_or_create_by!(name: "Promos") { |c| c.position = 2 }
bebidas_pizza = pizza_restaurant.categories.find_or_create_by!(name: "Bebidas") { |c| c.position = 3 }
postres_pizza = pizza_restaurant.categories.find_or_create_by!(name: "Postres") { |c| c.position = 4 }

[
  [ pizzas, "Muzzarella", "Salsa de tomate, mozzarella y aceitunas", 8900.00, 1 ],
  [ pizzas, "Napolitana", "Tomate fresco, ajo, mozzarella y orégano", 9800.00, 2 ],
  [ pizzas, "Jamón y Morrones", "Jamón cocido, morrones asados y mozzarella", 10400.00, 3 ],
  [ pizzas, "Fugazzeta Rellena", "Cebolla salteada y doble queso", 11200.00, 4 ],
  [ promos, "Promo 2 Muzzas + Gaseosa", "Ideal para compartir", 16800.00, 1 ],
  [ promos, "Promo Familiar", "1 fugazzeta + 1 napolitana + 2 bebidas", 24100.00, 2 ],
  [ bebidas_pizza, "Gaseosa 1.5L", "Cola / Naranja / Lima-Limón", 3200.00, 1 ],
  [ bebidas_pizza, "Agua con gas", "1.5L", 2600.00, 2 ],
  [ postres_pizza, "Flan casero", "Con dulce de leche y crema", 2800.00, 1 ],
  [ postres_pizza, "Tiramisú", "Porción individual", 3600.00, 2 ],
].each do |category, name, description, price, position|
  category.products.find_or_create_by!(name: name) do |p|
    p.description = description
    p.price = price
    p.position = position
    p.available = true
  end
end

# Multi-restaurant demo user (owner in many restaurants)
multi_admin_email = "multi@pedidofacil.dev"
multi_admin_password = "password123"
multi_admin_name = "Multi Restaurant Admin"

[
  {
    name: "Burgers Demo",
    slug: "burgers-demo",
    address: "Av. Cabildo 1870, CABA",
    phone: "+54 11 4000-1201",
    description: "Smash burgers, papas y combos.",
    currency: "ARS",
    settings: { "accepting_orders" => true, "estimated_wait_minutes" => 18 }
  },
  {
    name: "Sushi Demo",
    slug: "sushi-demo",
    address: "Uriarte 1400, Palermo, CABA",
    phone: "+54 11 4000-1202",
    description: "Rolls, nigiris y pokes frescos.",
    currency: "ARS",
    settings: { "accepting_orders" => true, "estimated_wait_minutes" => 25 }
  },
  {
    name: "Tacos Demo",
    slug: "tacos-demo",
    address: "Honduras 5200, CABA",
    phone: "+54 11 4000-1203",
    description: "Tacos, quesadillas y nachos.",
    currency: "ARS",
    settings: { "accepting_orders" => true, "estimated_wait_minutes" => 15 }
  },
  {
    name: "Pasta Demo",
    slug: "pastas-demo",
    address: "Belgrano 980, CABA",
    phone: "+54 11 4000-1204",
    description: "Pastas frescas y salsas caseras.",
    currency: "ARS",
    settings: { "accepting_orders" => true, "estimated_wait_minutes" => 22 }
  }
].each do |attrs|
  created = ensure_restaurant!(
    **attrs,
    admin_email: multi_admin_email,
    admin_password: multi_admin_password,
    admin_name: multi_admin_name
  )
  puts "Restaurant: #{created[:restaurant].name} (#{created[:restaurant].slug}) -> member: #{multi_admin_email}"
end

puts "Seeded #{Product.count} products across #{Category.count} categories"
puts ""
puts "=== Demo URLs ==="
puts "Public menu:  http://localhost:3000/empanadas-demo"
puts "Public menu:  http://localhost:3000/pizzas-demo"
puts "Admin panel:  http://localhost:3000/admin/orders"
puts "Super admin:  http://localhost:3000/super_admin/restaurants"
puts ""
puts "=== Login credentials ==="
puts "Restaurant admin: demo@empanada.dev / password123"
puts "Pizza admin:      pizza@pedidofacil.dev / password123"
puts "Multi member:    multi@pedidofacil.dev / password123"
puts "Super admin: from ENV (optional)"
ensure
ActiveJob::Base.queue_adapter = previous_queue_adapter
end
