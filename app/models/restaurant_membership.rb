class RestaurantMembership < ApplicationRecord
  belongs_to :user
  belongs_to :restaurant

  enum :role, { member: 0 }

  validates :user_id, uniqueness: { scope: :restaurant_id }
end
