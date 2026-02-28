class OrderPolicy < ApplicationPolicy
  def index?
    staff?
  end

  def show?
    staff?
  end

  def update?
    staff?
  end
end
