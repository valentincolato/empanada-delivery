require 'rails_helper'

RSpec.describe Restaurant, type: :model do
  subject { build(:restaurant) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:slug) }
    it { is_expected.to validate_presence_of(:currency) }

    it "auto-generates slug from name when blank" do
      restaurant = build(:restaurant, name: "La Tasca", slug: nil)
      restaurant.valid?
      expect(restaurant.slug).to eq("la-tasca")
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:categories).dependent(:destroy) }
    it { is_expected.to have_many(:orders).dependent(:destroy) }
    it { is_expected.to have_many(:restaurant_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:members).through(:restaurant_memberships) }
  end

  describe "#accepting_orders?" do
    it "returns true by default" do
      restaurant = build(:restaurant, settings: {})
      expect(restaurant.accepting_orders?).to be true
    end

    it "returns false when disabled" do
      restaurant = build(:restaurant, settings: { "accepting_orders" => false })
      expect(restaurant.accepting_orders?).to be false
    end
  end

  describe "#toggle_accepting_orders!" do
    it "toggles accepting_orders from true to false" do
      restaurant = create(:restaurant, settings: { "accepting_orders" => true })
      restaurant.toggle_accepting_orders!
      expect(restaurant.reload.accepting_orders?).to be false
    end

    it "toggles accepting_orders from false to true" do
      restaurant = create(:restaurant, settings: { "accepting_orders" => false })
      restaurant.toggle_accepting_orders!
      expect(restaurant.reload.accepting_orders?).to be true
    end
  end

  describe "#place_order!" do
    let(:restaurant) { create(:restaurant) }
    let(:category) { create(:category, restaurant: restaurant) }
    let(:product) { create(:product, category: category, price: 10.0) }

    let(:items) do
      [ { product_id: product.id, product_name: product.name, unit_price_cents: 1000, quantity: 2, notes: nil } ]
    end

    it "creates an order with items and correct total" do
      order = restaurant.place_order!(
        customer_name: "Ana",
        customer_address: "Calle 123",
        payment_method: "cash",
        items: items
      )
      expect(order).to be_persisted
      expect(order.order_items.count).to eq(1)
      expect(order.total_cents).to eq(2000)
    end

    it "generates a token" do
      order = restaurant.place_order!(
        customer_name: "Ana",
        customer_address: "Calle 123",
        payment_method: "transfer",
        items: items
      )
      expect(order.token).to be_present
    end
  end

  describe "#provision_admin!" do
    let(:restaurant) { create(:restaurant) }

    it "creates a restaurant_admin owner membership" do
      admin = restaurant.provision_admin!(email: "admin@test.com", password: "secret123")
      expect(admin.restaurant_admin?).to be true
      expect(admin.membership_for(restaurant)).to be_present
      expect(admin.membership_for(restaurant).owner?).to be true
    end
  end
end
