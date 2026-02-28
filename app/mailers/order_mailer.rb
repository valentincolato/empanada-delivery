class OrderMailer < ApplicationMailer
  def new_order_notification(order)
    @order = order
    @restaurant = order.restaurant

    mail(
      to: notification_recipients(@restaurant),
      subject: "New order ##{@order.id} — #{@restaurant.name}"
    )
  end

  def order_status_update(order)
    @order = order
    @restaurant = order.restaurant

    mail(
      to: @order.customer_email,
      subject: "Your order at #{@restaurant.name} — Status: #{@order.status.capitalize}"
    )
  end

  private

  def notification_recipients(restaurant)
    restaurant.users.restaurant_admin.pluck(:email).presence || [ "admin@example.com" ]
  end
end
