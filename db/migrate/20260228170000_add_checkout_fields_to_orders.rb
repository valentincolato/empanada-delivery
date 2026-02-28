class AddCheckoutFieldsToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :customer_address, :text
    add_column :orders, :payment_method, :string, null: false, default: "cash"
    add_column :orders, :cash_change_for_cents, :integer

    add_index :orders, :payment_method
  end
end
