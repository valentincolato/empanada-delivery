class Api::V1::SuperAdmin::RestaurantsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_super_admin!

  def index
    restaurants = Restaurant.all.order(:name)
    render json: RestaurantBlueprint.render_as_hash(restaurants)
  end

  def show
    render json: RestaurantBlueprint.render_as_hash(restaurant)
  end

  def create
    result = CreateRestaurant.new(
      name: restaurant_params[:name],
      slug: restaurant_params[:slug],
      address: restaurant_params[:address],
      phone: restaurant_params[:phone],
      description: restaurant_params[:description],
      currency: restaurant_params[:currency] || "ARS",
      admin_email: params.require(:admin_email),
      admin_password: params.require(:admin_password),
      admin_name: params[:admin_name]
    ).call
    render json: RestaurantBlueprint.render_as_hash(result[:restaurant]), status: :created
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def update
    if restaurant.update(restaurant_params)
      render json: RestaurantBlueprint.render_as_hash(restaurant)
    else
      render json: { errors: restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    restaurant.destroy!
    head :no_content
  end

  private

  def restaurant
    @restaurant ||= Restaurant.find(params[:id])
  end

  def restaurant_params
    params.require(:restaurant).permit(:name, :slug, :address, :phone, :description, :currency, :active, settings: {})
  end

  def require_super_admin!
    render json: { error: "Forbidden" }, status: :forbidden unless current_user.super_admin?
  end
end
