class Category < ApplicationRecord
  belongs_to :restaurant
  has_many :products, dependent: :destroy

  validates :name, presence: true
  validates :position, presence: true

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:position, :name) }
end
