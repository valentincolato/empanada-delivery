class AddFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :name, :string
    add_column :users, :role, :integer, null: false, default: 0
    add_column :users, :restaurant_id, :integer
    add_index :users, :restaurant_id
  end
end
