FactoryBot.define do
  factory :product do
    association :category
    name { Faker::Food.dish }
    description { Faker::Food.description }
    price { Faker::Commerce.price(range: 5.0..100.0) }
    available { true }
    position { 0 }
  end
end
