require "rails_helper"

RSpec.describe OrderMailer, type: :mailer do
  describe "#new_order_notification" do
    let(:restaurant) { create(:restaurant) }
    let(:order) { create(:order, restaurant: restaurant) }

    it "sends to restaurant admin emails when present" do
      admin = create(:user, :restaurant_admin, restaurant: restaurant, email: "admin@restaurant.test")

      mail = described_class.new_order_notification(order)

      expect(mail.to).to eq([ admin.email ])
    end

    it "falls back to admin@example.com when no restaurant admin exists" do
      mail = described_class.new_order_notification(order)

      expect(mail.to).to eq([ "admin@example.com" ])
    end
  end
end
