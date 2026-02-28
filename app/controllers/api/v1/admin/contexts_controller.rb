class Api::V1::Admin::ContextsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_restaurant_admin!

  def switch
    restaurant = current_user.restaurants.find(params[:restaurant_id])
    session[:admin_restaurant_id] = restaurant.id
    render json: { redirect_to: "/admin/orders" }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Acceso denegado" }, status: :forbidden
  end

  def clear
    session.delete(:admin_restaurant_id)
    render json: { redirect_to: "/panel" }
  end

  private

  def require_restaurant_admin!
    return if current_user.restaurant_admin?

    render json: { error: "Forbidden" }, status: :forbidden
  end
end
