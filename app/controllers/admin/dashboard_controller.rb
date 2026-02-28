class Admin::DashboardController < ApplicationController
  before_action :authenticate_user!
  before_action :require_restaurant_admin!

  def index
    redirect_to admin_orders_path
  end

  def orders; end
  def products; end
  def categories; end
  def qr; end

  private

  def require_restaurant_admin!
    unless current_user.restaurant_admin?
      redirect_to root_path, alert: "Access denied"
    end
  end
end
