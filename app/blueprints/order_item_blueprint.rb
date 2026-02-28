class OrderItemBlueprint < Blueprinter::Base
  identifier :id
  fields :product_id, :product_name, :unit_price_cents, :quantity, :subtotal_cents, :notes
  field(:unit_price) { |i| i.unit_price_cents / 100.0 }
  field(:subtotal) { |i| i.subtotal_cents / 100.0 }
end
