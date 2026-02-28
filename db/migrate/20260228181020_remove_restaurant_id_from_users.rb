class RemoveRestaurantIdFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_index :users, :restaurant_id, if_exists: true
    remove_column :users, :restaurant_id, :integer
  end
end
