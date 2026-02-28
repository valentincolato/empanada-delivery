class CategoryBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :position, :active

  view :with_products do
    association :products, blueprint: ProductBlueprint, view: :with_image_url do |category, _options|
      category.products.available.ordered
    end
  end
end
