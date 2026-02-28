class OrderBlueprint < Blueprinter::Base
  identifier :id
  fields :customer_name, :customer_phone, :customer_email,
         :table_number, :status, :total_cents, :notes, :token, :created_at

  field(:total) { |o| o.total_cents / 100.0 }

  view :with_items do
    association :order_items, blueprint: OrderItemBlueprint
    field(:restaurant_name) { |o| o.restaurant.name }
    field(:restaurant_slug) { |o| o.restaurant.slug }
  end
end
