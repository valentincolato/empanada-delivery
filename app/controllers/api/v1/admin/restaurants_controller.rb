class Api::V1::Admin::RestaurantsController < Api::V1::Admin::BaseController
  def show
    authorize current_restaurant, :show?
    render json: RestaurantBlueprint.render_as_hash(current_restaurant)
  end

  def update
    authorize current_restaurant, :update?
    if current_restaurant.update(restaurant_params)
      render json: RestaurantBlueprint.render_as_hash(current_restaurant)
    else
      render json: { errors: current_restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def toggle_accepting_orders
    authorize current_restaurant, :toggle_accepting_orders?
    new_value = current_restaurant.toggle_accepting_orders!
    render json: { accepting_orders: new_value }
  end

  def qr_code
    authorize current_restaurant, :qr_code?
    result = Restaurants::GenerateQrAction.call(
      restaurant: current_restaurant,
      base_url: request.base_url
    )
    if result.success?
      render json: result.value
    else
      render json: { error: result.value }, status: :unprocessable_entity
    end
  end

  private

  def restaurant_params
    params.require(:restaurant).permit(:name, :address, :phone, :description, :currency, settings: {})
  end
end
