class Order < ApplicationRecord
  PAYMENT_METHODS = %w[cash transfer].freeze

  belongs_to :restaurant
  belongs_to :user, optional: true
  has_many :order_items, dependent: :destroy

  enum :status, {
    pending: 0,
    confirmed: 1,
    out_for_delivery: 2,
    ready: 3,
    delivered: 4,
    cancelled: 5
  }

  VALID_TRANSITIONS = {
    "pending"          => %w[confirmed cancelled],
    "confirmed"        => %w[out_for_delivery cancelled],
    "out_for_delivery" => %w[delivered cancelled],
    "ready"            => %w[delivered cancelled],
    "delivered"        => [],
    "cancelled"        => []
  }.freeze

  validates :customer_name, presence: true
  validates :customer_address, presence: true
  validates :payment_method, inclusion: { in: PAYMENT_METHODS }
  validates :cash_change_for_cents, numericality: { greater_than: 0 }, allow_nil: true
  validate :cash_change_for_payment_rules
  validates :token, presence: true, uniqueness: true
  validates :total_cents, numericality: { greater_than_or_equal_to: 0 }

  before_validation :generate_token, on: :create

  # --- Aggregate methods ---

  def add_items!(items)
    raise "Cannot add items to a #{status} order" unless pending?

    items.each do |item|
      order_items.create!(
        product_id: item[:product_id],
        product_name: item[:product_name],
        unit_price_cents: item[:unit_price_cents],
        quantity: item[:quantity],
        subtotal_cents: item[:unit_price_cents] * item[:quantity],
        notes: item[:notes]
      )
    end
  end

  def recalculate_total!
    update!(total_cents: order_items.sum(:subtotal_cents))
  end

  def confirm!
    transition_to!("confirmed")
  end

  def cancel!(reason: nil)
    transition_to!("cancelled")
  end

  def update_status!(new_status)
    transition_to!(new_status.to_s)
  end

  def can_transition_to?(new_status)
    VALID_TRANSITIONS.fetch(status, []).include?(new_status.to_s)
  end

  private

  def cash_change_for_payment_rules
    if payment_method == "transfer" && cash_change_for_cents.present?
      errors.add(:cash_change_for_cents, "must be blank for transfer payments")
    end
  end

  def generate_token
    self.token ||= SecureRandom.uuid
  end

  def transition_to!(new_status)
    unless can_transition_to?(new_status)
      raise "Invalid transition: #{status} → #{new_status}"
    end

    update!(status: new_status)
  end
end
