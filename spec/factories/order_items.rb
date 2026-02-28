FactoryBot.define do
  factory :order_item do
    association :order
    association :product
    product_name { product.name }
    unit_price_cents { 1000 }
    quantity { 1 }
    subtotal_cents { 1000 }
  end
end
