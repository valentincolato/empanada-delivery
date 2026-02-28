class ProductBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :description, :price, :available, :position

  view :with_image_url do
    field(:image_url) do |product, options|
      if product.image.attached?
        path = Rails.application.routes.url_helpers.rails_blob_path(product.image, only_path: true)
        options[:base_url].present? ? "#{options[:base_url]}#{path}" : path
      end
    end
    field :category_id
  end
end
