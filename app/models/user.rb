class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum :role, { customer: 0, restaurant_admin: 1, super_admin: 2 }

  belongs_to :restaurant, optional: true

  validates :role, presence: true
  validates :restaurant, presence: true, if: :restaurant_admin?
end
