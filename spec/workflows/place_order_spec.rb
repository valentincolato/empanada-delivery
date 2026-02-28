require 'rails_helper'

RSpec.describe PlaceOrder do
  let(:restaurant) { create(:restaurant, settings: { "accepting_orders" => true }) }
  let(:category) { create(:category, restaurant: restaurant) }
  let(:product) { create(:product, category: category, price: 15.0, available: true) }
  let(:cart_items) { [ { product_id: product.id, quantity: 2, notes: nil } ] }

  subject(:workflow) do
    described_class.new(
      restaurant: restaurant,
      customer_name: "María",
      customer_phone: "1122334455",
      customer_email: "maria@test.com",
      customer_address: "Av. Siempre Viva 742",
      payment_method: "cash",
      cart_items: cart_items
    )
  end

  it "creates an order with correct total" do
    expect { workflow.call }.to change(Order, :count).by(1)
    order = Order.last
    expect(order.total_cents).to eq(3000)
    expect(order.customer_name).to eq("María")
  end

  it "enqueues a notification job" do
    expect { workflow.call }.to have_enqueued_job(NotifyRestaurantNewOrderJob)
  end

  context "when restaurant is not accepting orders" do
    before { restaurant.update!(settings: { "accepting_orders" => false }) }

    it "raises an error" do
      expect { workflow.call }.to raise_error(RuntimeError, /not accepting orders/)
    end
  end

  context "when a product is unavailable" do
    before { product.update!(available: false) }

    it "raises an error" do
      expect { workflow.call }.to raise_error(RuntimeError, /not available/)
    end
  end
end
