class CleanupOldPendingOrdersJob < ApplicationJob
  queue_as :low

  def perform
    cutoff = 2.hours.ago
    Order.pending.where("created_at < ?", cutoff).find_each do |order|
      order.cancel!(reason: "auto_expired")
    end
  end
end
