class Api::V1::Admin::ProductsController < Api::V1::Admin::BaseController
  def index
    products = current_restaurant.products.ordered.includes(:category, image_attachment: :blob)
    render json: ProductBlueprint.render_as_hash(products, view: :with_image_url)
  end

  def show
    product = current_restaurant.products.find(params[:id])
    render json: ProductBlueprint.render_as_hash(product, view: :with_image_url)
  end

  def create
    category = current_restaurant.categories.find(product_params[:category_id])
    product = category.products.build(product_params.except(:category_id))
    product.category = category

    if product.save
      attach_image(product)
      render json: ProductBlueprint.render_as_hash(product, view: :with_image_url), status: :created
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    product = current_restaurant.products.find(params[:id])

    if product.update(product_params.except(:category_id))
      attach_image(product) if params[:product][:image].present?
      render json: ProductBlueprint.render_as_hash(product, view: :with_image_url)
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    product = current_restaurant.products.find(params[:id])
    product.destroy!
    head :no_content
  end

  private

  def product_params
    params.require(:product).permit(:name, :description, :price, :available, :position, :category_id, :image)
  end

  def attach_image(product)
    product.image.attach(params[:product][:image]) if params[:product][:image].present?
  end
end
