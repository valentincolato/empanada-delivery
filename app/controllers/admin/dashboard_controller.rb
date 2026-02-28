class Admin::DashboardController < ApplicationController
  include AdminContext

  before_action :redirect_guests_to_panel_login!
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
  def members; end

  private

  def redirect_guests_to_panel_login!
    return if user_signed_in?

    redirect_to panel_login_path
  end

  def require_admin_access!
    return if current_user.restaurant_admin? || current_user.super_admin?

    redirect_to panel_path, alert: "Acceso denegado."
  end

  def require_current_restaurant!
    return if current_restaurant.present?

    redirect_to panel_path, alert: "Restaurant context not found."
  end
end
