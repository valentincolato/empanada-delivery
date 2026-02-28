FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { "password123" }
    name { Faker::Name.name }
    role { :customer }

    trait :restaurant_admin do
      role { :restaurant_admin }

      transient do
        membership_restaurant { nil }
        membership_role { :member }
      end

      after(:create) do |user, evaluator|
        restaurant = evaluator.membership_restaurant || create(:restaurant)
        create(:restaurant_membership, user: user, restaurant: restaurant, role: evaluator.membership_role)
      end
    end

    trait :super_admin do
      role { :super_admin }
    end
  end
end
