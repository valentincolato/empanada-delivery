class CreateRestaurant
  def initialize(name:, slug: nil, address: nil, phone: nil, description: nil,
                 currency: "ARS", settings: {}, admin_email:, admin_password:, admin_name: nil)
    @name = name
    @slug = slug
    @address = address
    @phone = phone
    @description = description
    @currency = currency
    @settings = settings
    @admin_email = admin_email
    @admin_password = admin_password
    @admin_name = admin_name
  end

  def call
    ActiveRecord::Base.transaction do
      restaurant = Restaurant.create!(
        name: @name,
        slug: @slug,
        address: @address,
        phone: @phone,
        description: @description,
        currency: @currency,
        settings: @settings
      )
      admin = restaurant.provision_admin!(
        email: @admin_email,
        password: @admin_password,
        name: @admin_name
      )
      { restaurant: restaurant, admin: admin }
    end
  end
end
