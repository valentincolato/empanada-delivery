class Api::V1::OrdersController < ActionController::API
  def show
    order = Order.includes(:order_items, :restaurant).find_by!(token: params[:token])
    render json: OrderBlueprint.render_as_hash(order, view: :with_items)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Order not found" }, status: :not_found
  end

  def create
    restaurant = Restaurant.active.find_by!(slug: order_params[:restaurant_slug])

    order = PlaceOrder.new(
      restaurant: restaurant,
      customer_name: order_params[:customer_name],
      customer_phone: order_params[:customer_phone],
      customer_email: order_params[:customer_email],
      table_number: order_params[:table_number],
      notes: order_params[:notes],
      cart_items: order_params[:items]
    ).call

    render json: OrderBlueprint.render_as_hash(order, view: :with_items), status: :created
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: e.message }, status: :not_found
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def order_params
    params.require(:order).permit(
      :restaurant_slug, :customer_name, :customer_phone,
      :customer_email, :table_number, :notes,
      items: [ :product_id, :quantity, :notes ]
    )
  end
end
