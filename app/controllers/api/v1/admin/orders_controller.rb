class Api::V1::Admin::OrdersController < Api::V1::Admin::BaseController
  def index
    orders = current_restaurant.orders
                               .includes(:order_items, :user)
                               .order(created_at: :desc)
    render json: OrderBlueprint.render_as_hash(orders, view: :with_items)
  end

  def show
    order = current_restaurant.orders.find(params[:id])
    render json: OrderBlueprint.render_as_hash(order, view: :with_items)
  end

  def update
    order = current_restaurant.orders.find(params[:id])
    new_status = params.require(:order).require(:status)

    UpdateOrderStatus.new(order: order, new_status: new_status).call
    render json: OrderBlueprint.render_as_hash(order.reload, view: :with_items)
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end
