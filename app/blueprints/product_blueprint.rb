class ProductBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :description, :price, :available, :position

  view :with_image_url do
    field(:image_url) do |product, options|
      if product.image.attached?
        options[:base_url] ? "#{options[:base_url]}#{Rails.application.routes.url_helpers.rails_blob_path(product.image, only_path: true)}" : nil
      end
    end
    field :category_id
  end
end
