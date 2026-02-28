class Api::V1::Public::MenusController < ActionController::API
  def show
    restaurant = Restaurant.active.find_by!(slug: params[:slug])
    categories = restaurant.categories.active.ordered.includes(products: { image_attachment: :blob })

    render json: {
      restaurant: RestaurantBlueprint.render_as_hash(restaurant),
      categories: CategoryBlueprint.render_as_hash(categories, view: :with_products)
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Menu not found" }, status: :not_found
  end
end
