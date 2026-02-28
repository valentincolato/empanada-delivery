module AdminContext
  extend ActiveSupport::Concern

  included do
    helper_method :current_restaurant, :current_membership
  end

  private

  def current_restaurant
    @current_restaurant ||= if current_user.restaurant_admin?
      memberships = current_user.restaurant_memberships.includes(:restaurant)
      memberships.count == 1 ? memberships.first.restaurant : Restaurant.find_by(id: session[:admin_restaurant_id])
    elsif current_user.super_admin?
      Restaurant.find_by(id: session[:admin_restaurant_id])
    end
  end

  def current_membership
    @current_membership ||= if current_user.restaurant_admin? && current_restaurant
      current_user.membership_for(current_restaurant)
    end
  end

  def pundit_user
    { user: current_user, membership: current_membership }
  end
end
