FactoryBot.define do
  factory :category do
    association :restaurant
    name { Faker::Food.ethnic_category }
    position { 0 }
    active { true }
  end
end
