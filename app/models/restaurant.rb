class Restaurant < ApplicationRecord
  has_many :categories, dependent: :destroy
  has_many :products, through: :categories
  has_many :orders, dependent: :destroy
  has_many :users, dependent: :nullify

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true,
                   format: { with: /\A[a-z0-9-]+\z/, message: "only lowercase letters, numbers, and hyphens" }
  validates :currency, presence: true

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }

  # --- Query helpers ---

  scope :active, -> { where(active: true) }

  # --- Settings accessors ---

  def accepting_orders?
    settings.fetch("accepting_orders", true)
  end

  def estimated_wait_minutes
    settings.fetch("estimated_wait_minutes", nil)
  end

  # --- Aggregate methods ---

  def toggle_accepting_orders!
    new_value = !accepting_orders?
    update!(settings: settings.merge("accepting_orders" => new_value))
    new_value
  end

  def place_order!(customer_name:, customer_phone: nil, customer_email: nil,
                   customer_address:, payment_method:, cash_change_for_cents: nil,
                   table_number: nil, notes: nil, items:, user: nil)
    transaction do
      order = orders.create!(
        customer_name: customer_name,
        customer_phone: customer_phone,
        customer_email: customer_email,
        customer_address: customer_address,
        payment_method: payment_method,
        cash_change_for_cents: cash_change_for_cents,
        table_number: table_number,
        notes: notes,
        user: user,
        status: :pending,
        total_cents: 0,
        token: SecureRandom.uuid
      )
      order.add_items!(items)
      order.recalculate_total!
      order
    end
  end

  def provision_admin!(email:, password:, name: nil)
    users.create!(
      email: email,
      password: password,
      name: name,
      role: :restaurant_admin
    )
  end

  private

  def generate_slug
    self.slug = name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
  end
end
