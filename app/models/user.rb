class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum :role, { customer: 0, restaurant_admin: 1, super_admin: 2 }

  has_many :restaurant_memberships, dependent: :destroy
  has_many :restaurants, through: :restaurant_memberships

  validates :role, presence: true

  def membership_for(restaurant)
    restaurant_memberships.find_by(restaurant: restaurant)
  end
end
