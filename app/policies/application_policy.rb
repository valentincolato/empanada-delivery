class ApplicationPolicy
  attr_reader :context, :record

  def initialize(context, record)
    @context = context || {}
    @record = record
  end

  def user
    context.is_a?(Hash) ? context[:user] : context
  end

  def membership
    context.is_a?(Hash) ? context[:membership] : nil
  end

  def super_admin?
    user&.super_admin?
  end

  def restaurant_member?
    super_admin? || membership.present?
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end
end
