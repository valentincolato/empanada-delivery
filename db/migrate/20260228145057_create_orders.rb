class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.string :customer_name, null: false
      t.string :customer_phone
      t.string :customer_email
      t.string :table_number
      t.integer :status, null: false, default: 0
      t.integer :total_cents, null: false, default: 0
      t.text :notes
      t.string :token, null: false

      t.timestamps
    end

    add_index :orders, :token, unique: true
    add_index :orders, :status
  end
end
