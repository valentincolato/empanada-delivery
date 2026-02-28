FactoryBot.define do
  factory :restaurant do
    name { Faker::Restaurant.name }
    slug { Faker::Internet.unique.slug(glue: "-") }
    address { Faker::Address.full_address }
    phone { Faker::PhoneNumber.phone_number }
    description { Faker::Lorem.sentence }
    currency { "ARS" }
    active { true }
    settings { { "accepting_orders" => true } }
  end
end
