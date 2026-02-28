class NotifyRestaurantNewOrderJob < ApplicationJob
  queue_as :high

  def perform(order_id)
    order = Order.includes(:restaurant, :order_items).find_by(id: order_id)
    return unless order

    OrderMailer.new_order_notification(order).deliver_now
  end
end
