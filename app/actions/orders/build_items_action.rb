module Orders
  class BuildItemsAction < BaseAction
    attr_accessor :restaurant, :cart_items

    validates_presence_of :restaurant, :cart_items

    def perform
      items = validate_and_build_items
      success!(items)
    end

    private

    def validate_and_build_items
      cart_items.map do |cart_item|
        product = find_available_product(cart_item[:product_id])
        quantity = validate_quantity(cart_item[:quantity])

        {
          product_id: product.id,
          product_name: product.name,
          unit_price_cents: product.price_cents,
          quantity: quantity,
          notes: cart_item[:notes]
        }
      end
    end

    def find_available_product(product_id)
      product = restaurant.products.available.find_by(id: product_id)
      fail!("Product #{product_id} is not available") unless product
      product
    end

    def validate_quantity(quantity)
      qty = quantity.to_i
      fail!("Quantity must be greater than 0") unless qty > 0
      qty
    end
  end
end
