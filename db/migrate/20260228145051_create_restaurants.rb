class CreateRestaurants < ActiveRecord::Migration[8.1]
  def change
    create_table :restaurants do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :address
      t.string :phone
      t.text :description
      t.string :currency, null: false, default: "ARS"
      t.boolean :active, null: false, default: true
      t.jsonb :settings, null: false, default: {}

      t.timestamps
    end

    add_index :restaurants, :slug, unique: true
  end
end
