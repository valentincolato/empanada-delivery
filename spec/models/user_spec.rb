require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "associations" do
    it { is_expected.to have_many(:restaurant_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:restaurants).through(:restaurant_memberships) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:role) }
  end

  describe "role enum" do
    it "defines expected roles" do
      expect(described_class.roles.keys).to contain_exactly("customer", "restaurant_admin", "super_admin")
    end
  end

  describe "#membership_for" do
    it "returns membership for the given restaurant" do
      user = create(:user)
      restaurant = create(:restaurant)
      membership = create(:restaurant_membership, user: user, restaurant: restaurant, role: :member)

      expect(user.membership_for(restaurant)).to eq(membership)
    end
  end
end
