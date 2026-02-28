FactoryBot.define do
  factory :restaurant_membership do
    association :user
    association :restaurant
    role { :staff }
  end
end
