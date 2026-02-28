class NotifyCustomerOrderStatusJob < ApplicationJob
  queue_as :high

  def perform(order_id)
    order = Order.includes(:restaurant, :order_items).find_by(id: order_id)
    return unless order
    return if order.customer_email.blank?

    OrderMailer.order_status_update(order).deliver_now
  end
end
