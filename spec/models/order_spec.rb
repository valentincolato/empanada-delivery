require 'rails_helper'

RSpec.describe Order, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:customer_name) }
    it { is_expected.to validate_presence_of(:customer_address) }
    it { is_expected.to belong_to(:restaurant) }
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to have_many(:order_items).dependent(:destroy) }
  end

  describe "token auto-generation" do
    it "generates a UUID token before creation" do
      restaurant = create(:restaurant)
      order = restaurant.orders.create!(
        customer_name: "Test",
        customer_address: "Main St 123",
        payment_method: "cash",
        status: :pending,
        total_cents: 0
      )
      expect(order.token).to match(/\A[0-9a-f-]{36}\z/)
    end
  end

  describe "status transitions" do
    let(:order) { create(:order, status: :pending) }

    it "can be confirmed from pending" do
      order.confirm!
      expect(order.reload.status).to eq("confirmed")
    end

    it "cannot skip from pending to out_for_delivery" do
      expect { order.update_status!("out_for_delivery") }.to raise_error(RuntimeError, /Invalid transition/)
    end

    it "can be cancelled from pending" do
      order.cancel!
      expect(order.reload.status).to eq("cancelled")
    end

    it "cannot transition from cancelled" do
      order.cancel!
      expect { order.confirm! }.to raise_error(RuntimeError, /Invalid transition/)
    end
  end

  describe "#can_transition_to?" do
    it "returns true for valid transitions" do
      order = build(:order, status: :pending)
      expect(order.can_transition_to?("confirmed")).to be true
      expect(order.can_transition_to?("cancelled")).to be true
    end

    it "returns false for invalid transitions" do
      order = build(:order, status: :pending)
      expect(order.can_transition_to?("out_for_delivery")).to be false
      expect(order.can_transition_to?("delivered")).to be false
    end
  end

  describe "payment validations" do
    it "does not allow cash change for transfer payments" do
      order = build(:order, payment_method: "transfer", cash_change_for_cents: 5000)

      expect(order).not_to be_valid
      expect(order.errors[:cash_change_for_cents]).to include("must be blank for transfer payments")
    end

    it "allows cash change for cash payments" do
      order = build(:order, payment_method: "cash", cash_change_for_cents: 5000)

      expect(order).to be_valid
    end
  end
end
