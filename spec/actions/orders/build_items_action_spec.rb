require 'rails_helper'

RSpec.describe Orders::BuildItemsAction do
  let(:restaurant) { create(:restaurant) }
  let(:category) { create(:category, restaurant: restaurant) }
  let(:product) { create(:product, category: category, price: 10.0, available: true) }

  let(:cart_items) { [ { product_id: product.id, quantity: 2, notes: "extra spicy" } ] }

  subject(:result) { described_class.call(restaurant: restaurant, cart_items: cart_items) }

  it "returns a success result" do
    expect(result.success?).to be true
  end

  it "builds items with snapshot data" do
    item = result.value.first
    expect(item[:product_name]).to eq(product.name)
    expect(item[:unit_price_cents]).to eq(1000)
    expect(item[:quantity]).to eq(2)
  end

  context "with unavailable product" do
    before { product.update!(available: false) }
    it "returns a failure" do
      expect(result.success?).to be false
    end
  end

  context "with zero quantity" do
    let(:cart_items) { [ { product_id: product.id, quantity: 0 } ] }
    it "returns a failure" do
      expect(result.success?).to be false
    end
  end
end
