class PanelController < ApplicationController
  before_action :authenticate_user!
  before_action :set_admin_restaurant_from_param!, only: :index

  def index; end

  private

  def set_admin_restaurant_from_param!
    return unless current_user.restaurant_admin?
    return if params[:restaurant_id].blank?

    restaurant_id = params[:restaurant_id].to_i
    return if restaurant_id <= 0
    return unless current_user.restaurants.exists?(id: restaurant_id)

    session[:admin_restaurant_id] = restaurant_id
  end
end
