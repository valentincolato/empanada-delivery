class RestaurantMembership < ApplicationRecord
  belongs_to :user
  belongs_to :restaurant

  enum :role, { staff: 0, manager: 1, owner: 2 }

  validates :user_id, uniqueness: { scope: :restaurant_id }
end
