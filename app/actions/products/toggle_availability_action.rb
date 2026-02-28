module Products
  class ToggleAvailabilityAction < BaseAction
    attr_accessor :product

    validates_presence_of :product

    def perform
      new_availability = !product.available?
      product.update!(available: new_availability)
      success!(product)
    end
  end
end
