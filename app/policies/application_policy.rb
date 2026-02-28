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

  def owner?
    super_admin? || membership&.owner?
  end

  def manager?
    super_admin? || membership&.owner? || membership&.manager?
  end

  def staff?
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
