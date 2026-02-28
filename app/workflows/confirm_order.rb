class ConfirmOrder
  def initialize(order:)
    @order = order
  end

  def call
    @order.confirm!
    NotifyCustomerOrderStatusJob.perform_later(@order.id)
    @order
  end
end
