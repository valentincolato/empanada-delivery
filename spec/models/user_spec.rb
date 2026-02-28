require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "associations" do
    it { is_expected.to belong_to(:restaurant).optional }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:role) }

    it "requires restaurant for restaurant_admin users" do
      admin = build(:user, :restaurant_admin, restaurant: nil)

      expect(admin).not_to be_valid
      expect(admin.errors[:restaurant]).to include("no puede estar en blanco")
    end

    it "allows super_admin users without restaurant" do
      super_admin = build(:user, :super_admin, restaurant: nil)

      expect(super_admin).to be_valid
    end
  end

  describe "role enum" do
    it "defines expected roles" do
      expect(described_class.roles.keys).to contain_exactly("customer", "restaurant_admin", "super_admin")
    end
  end
end
