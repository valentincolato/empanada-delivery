class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :product_name, presence: true
  validates :unit_price_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :subtotal_cents, presence: true, numericality: { greater_than_or_equal_to: 0 }

  def unit_price
    unit_price_cents / 100.0
  end

  def subtotal
    subtotal_cents / 100.0
  end
end
