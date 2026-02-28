FactoryBot.define do
  factory :order do
    association :restaurant
    customer_name { Faker::Name.name }
    customer_phone { Faker::PhoneNumber.phone_number }
    customer_email { Faker::Internet.email }
    customer_address { Faker::Address.full_address }
    payment_method { "cash" }
    cash_change_for_cents { nil }
    status { :pending }
    total_cents { 0 }
    token { SecureRandom.uuid }
  end
end
