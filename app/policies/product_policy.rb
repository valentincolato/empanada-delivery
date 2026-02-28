class ProductPolicy < ApplicationPolicy
  def index?
    restaurant_member?
  end

  def show?
    restaurant_member?
  end

  def create?
    restaurant_member?
  end

  def update?
    restaurant_member?
  end

  def destroy?
    restaurant_member?
  end
end
