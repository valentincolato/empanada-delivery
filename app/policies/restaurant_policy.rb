class RestaurantPolicy < ApplicationPolicy
  def show?
    restaurant_member?
  end

  def qr_code?
    restaurant_member?
  end

  def toggle_accepting_orders?
    restaurant_member?
  end

  def update?
    restaurant_member?
  end
end
