# Create super admin
super_admin = User.find_or_create_by!(email: "admin@empanada.dev") do |u|
  u.password = "password123"
  u.name = "Super Admin"
  u.role = :super_admin
end
puts "Super admin: #{super_admin.email}"

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

# Products
[
  [ clasicas, "Carne Picante",    "Relleno de carne vacuna con especias picantes",   850.00, 1 ],
  [ clasicas, "Carne Suave",      "Relleno de carne vacuna con especias suaves",     850.00, 2 ],
  [ clasicas, "Jamón y Queso",    "Jamón cocido y queso cremoso",                    800.00, 3 ],
  [ clasicas, "Choclo",           "Choclo cremoso con queso",                        750.00, 4 ],
  [ clasicas, "Humita",           "Humita tradicional con leche",                    750.00, 5 ],
  [ especiales, "Pollo al Curry", "Pollo desmenuzado con curry y vegetales",         950.00, 1 ],
  [ especiales, "Caprese",        "Tomate, mozzarella y albahaca fresca",            900.00, 2 ],
  [ especiales, "Roquefort y Nuez", "Queso roquefort con nueces tostadas",            1000.00, 3 ],
  [ bebidas, "Agua Mineral",      "500ml",                                           350.00, 1 ],
  [ bebidas, "Gaseosa",           "Coca-Cola, Sprite o Fanta 500ml",                 450.00, 2 ],
  [ bebidas, "Limonada Natural",  "Preparada al momento",                            600.00, 3 ],
  [ postres, "Alfajor de Maicena", "Relleno de dulce de leche, cubierto con azúcar", 500.00, 1 ],
  [ postres, "Brownie",           "Con helado de crema americana",                   750.00, 2 ]
].each do |category, name, description, price, position|
  category.products.find_or_create_by!(name: name) do |p|
    p.description = description
    p.price = price
    p.position = position
    p.available = true
  end
end

puts "Seeded #{Product.count} products across #{Category.count} categories"
puts ""
puts "=== Demo URLs ==="
puts "Public menu:  http://localhost:3000/r/empanadas-demo"
puts "Admin panel:  http://localhost:3000/admin/orders"
puts "Super admin:  http://localhost:3000/super_admin/restaurants"
puts ""
puts "=== Login credentials ==="
puts "Super admin: admin@empanada.dev / password123"
puts "Restaurant admin: demo@empanada.dev / password123"
