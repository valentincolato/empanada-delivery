class SuperAdmin::DashboardController < ApplicationController
  before_action :authenticate_user!
  before_action :require_super_admin!

  def index
    redirect_to super_admin_restaurants_path
  end

  def restaurants; end

  private

  def require_super_admin!
    unless current_user.super_admin?
      redirect_to root_path, alert: "Access denied"
    end
  end
end
