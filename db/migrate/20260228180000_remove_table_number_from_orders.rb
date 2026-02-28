class RemoveTableNumberFromOrders < ActiveRecord::Migration[8.1]
  def change
    remove_column :orders, :table_number, :string
  end
end
