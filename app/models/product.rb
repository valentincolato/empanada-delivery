class Product < ApplicationRecord
  belongs_to :category
  has_one :restaurant, through: :category
  has_one_attached :image

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :position, presence: true

  scope :available, -> { where(available: true) }
  scope :ordered, -> { order(:position, :name) }

  def price_cents
    (price * 100).to_i
  end
end
