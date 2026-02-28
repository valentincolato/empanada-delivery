class PlaceOrder
  def initialize(restaurant:, customer_name:, customer_phone: nil,
                 customer_email: nil, customer_address:, payment_method:,
                 cash_change_for_cents: nil, table_number: nil, notes: nil,
                 cart_items:, user: nil)
    @restaurant = restaurant
    @customer_name = customer_name
    @customer_phone = customer_phone
    @customer_email = customer_email
    @customer_address = customer_address
    @payment_method = payment_method
    @cash_change_for_cents = cash_change_for_cents
    @table_number = table_number
    @notes = notes
    @cart_items = cart_items
    @user = user
  end

  def call
    validate_restaurant_active
    items = build_items
    order = create_order(items)
    enqueue_notification(order)
    order
  end

  private

  def validate_restaurant_active
    raise "Restaurant is not active" unless @restaurant.active?
    raise "Restaurant is not accepting orders" unless @restaurant.accepting_orders?
  end

  def build_items
    result = Orders::BuildItemsAction.call(
      restaurant: @restaurant,
      cart_items: @cart_items
    )
    raise result.value unless result.success?
    result.value
  end

  def create_order(items)
    @restaurant.place_order!(
      customer_name: @customer_name,
      customer_phone: @customer_phone,
      customer_email: @customer_email,
      customer_address: @customer_address,
      payment_method: @payment_method,
      cash_change_for_cents: @cash_change_for_cents,
      table_number: @table_number,
      notes: @notes,
      items: items,
      user: @user
    )
  end

  def enqueue_notification(order)
    NotifyRestaurantNewOrderJob.perform_later(order.id)
  end
end
