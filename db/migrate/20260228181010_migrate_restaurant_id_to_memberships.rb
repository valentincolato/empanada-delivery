class MigrateRestaurantIdToMemberships < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      INSERT INTO restaurant_memberships (user_id, restaurant_id, role, created_at, updated_at)
      SELECT id, restaurant_id, 2, NOW(), NOW()
      FROM users
      WHERE restaurant_id IS NOT NULL AND role = 1
      ON CONFLICT (user_id, restaurant_id) DO NOTHING
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
