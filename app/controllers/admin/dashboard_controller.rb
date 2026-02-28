class Admin::DashboardController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin_access!
  before_action :require_current_restaurant!

  def index
    redirect_to admin_orders_path
  end

  def orders; end
  def products; end
  def categories; end
  def qr; end

  private

  def current_restaurant
    return current_user.restaurant if current_user.restaurant_admin?
    return Restaurant.find_by(id: session[:admin_restaurant_id]) if current_user.super_admin?

    nil
  end

  def require_admin_access!
    return if current_user.restaurant_admin?
    return if current_user.super_admin? && current_restaurant.present?

    redirect_to panel_path, alert: "Select a restaurant from super admin to manage operations."
  end

  def require_current_restaurant!
    return if current_restaurant.present?

    redirect_to super_admin_restaurants_path, alert: "Restaurant context not found."
  end
end
