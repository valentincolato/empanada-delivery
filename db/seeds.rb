# Optional super admin (recommended for production via ENV)
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

# Create demo restaurant
result = CreateRestaurant.new(
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
).call

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

puts "Seeded #{Product.count} products across #{Category.count} categories"
puts ""
puts "=== Demo URLs ==="
puts "Public menu:  http://localhost:3000/r/empanadas-demo"
puts "Admin panel:  http://localhost:3000/admin/orders"
puts "Super admin:  http://localhost:3000/super_admin/restaurants"
puts ""
puts "=== Login credentials ==="
puts "Restaurant admin: demo@empanada.dev / password123"
puts "Super admin: from ENV (optional)"
