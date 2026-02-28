FactoryBot.define do
  factory :order do
    association :restaurant
    customer_name { Faker::Name.name }
    customer_phone { Faker::PhoneNumber.phone_number }
    customer_email { Faker::Internet.email }
    status { :pending }
    total_cents { 0 }
    token { SecureRandom.uuid }
  end
end
