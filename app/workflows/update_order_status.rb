class UpdateOrderStatus
  def initialize(order:, new_status:)
    @order = order
    @new_status = new_status
  end

  def call
    unless @order.can_transition_to?(@new_status)
      raise "Invalid status transition: #{@order.status} → #{@new_status}"
    end
    @order.update_status!(@new_status)
    NotifyCustomerOrderStatusJob.perform_later(@order.id)
    @order
  end
end
