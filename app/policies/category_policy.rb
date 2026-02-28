class CategoryPolicy < ApplicationPolicy
  def index?
    manager?
  end

  def show?
    manager?
  end

  def create?
    manager?
  end

  def update?
    manager?
  end

  def destroy?
    manager?
  end
end
