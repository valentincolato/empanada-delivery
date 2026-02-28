class NormalizeRestaurantMembershipRoles < ActiveRecord::Migration[8.1]
  def up
    execute("UPDATE restaurant_memberships SET role = 0")
  end

  def down
    # no-op: previous role granularity was intentionally removed
  end
end
