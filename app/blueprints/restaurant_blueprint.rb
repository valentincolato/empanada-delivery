class RestaurantBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :slug, :address, :phone, :description, :currency, :active, :settings, :created_at
  field(:accepting_orders) { |r| r.accepting_orders? }
  field(:estimated_wait_minutes) { |r| r.estimated_wait_minutes }
end
