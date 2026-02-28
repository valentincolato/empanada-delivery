class RestaurantMembershipPolicy < ApplicationPolicy
  def index?
    owner?
  end

  def create?
    owner?
  end

  def update?
    owner?
  end

  def destroy?
    owner?
  end
end
