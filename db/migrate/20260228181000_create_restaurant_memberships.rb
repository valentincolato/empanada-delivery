class CreateRestaurantMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :restaurant_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :restaurant, null: false, foreign_key: true
      t.integer :role, null: false, default: 0
      t.timestamps
    end

    add_index :restaurant_memberships, [ :user_id, :restaurant_id ], unique: true
  end
end
