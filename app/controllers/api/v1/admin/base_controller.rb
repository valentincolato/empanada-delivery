class Api::V1::Admin::BaseController < ApplicationController
  before_action :authenticate_user!
  before_action :require_restaurant_admin!
  before_action :require_current_restaurant!

  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  private

  def current_restaurant
    current_user.restaurant
  end

  def require_restaurant_admin!
    unless current_user.restaurant_admin?
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  def require_current_restaurant!
    if current_restaurant.blank?
      render json: { error: "Restaurant context not found" }, status: :forbidden
    end
  end

  def not_found(e)
    render json: { error: e.message }, status: :not_found
  end
end
