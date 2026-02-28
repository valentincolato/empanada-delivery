class Api::V1::Admin::BaseController < ApplicationController
  include AdminContext

  before_action :authenticate_user!, :require_restaurant_admin!, :require_current_restaurant!

  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  private

  def require_restaurant_admin!
    return if current_user.restaurant_admin? || current_user.super_admin?

    render json: { error: "Forbidden" }, status: :forbidden
  end

  def require_current_restaurant!
    return if current_restaurant.present?

    render json: { error: "Restaurant context not found" }, status: :forbidden
  end

  def not_found(e)
    render json: { error: e.message }, status: :not_found
  end
end
