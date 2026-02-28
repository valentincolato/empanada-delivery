class CancelOrder
  def initialize(order:, reason: nil)
    @order = order
    @reason = reason
  end

  def call
    @order.cancel!(reason: @reason)
    NotifyCustomerOrderStatusJob.perform_later(@order.id)
    @order
  end
end
