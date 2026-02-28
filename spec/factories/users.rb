FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { "password123" }
    name { Faker::Name.name }
    role { :customer }

    trait :restaurant_admin do
      role { :restaurant_admin }
      association :restaurant
    end

    trait :super_admin do
      role { :super_admin }
      restaurant { nil }
    end
  end
end
