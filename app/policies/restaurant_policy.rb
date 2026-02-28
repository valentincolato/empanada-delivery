class RestaurantPolicy < ApplicationPolicy
  def show?
    staff?
  end

  def qr_code?
    manager?
  end

  def toggle_accepting_orders?
    manager?
  end

  def update?
    owner?
  end
end
