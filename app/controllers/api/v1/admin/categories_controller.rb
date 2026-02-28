class Api::V1::Admin::CategoriesController < Api::V1::Admin::BaseController
  def index
    categories = current_restaurant.categories.ordered
    render json: CategoryBlueprint.render_as_hash(categories)
  end

  def create
    category = current_restaurant.categories.build(category_params)
    if category.save
      render json: CategoryBlueprint.render_as_hash(category), status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    category = current_restaurant.categories.find(params[:id])
    if category.update(category_params)
      render json: CategoryBlueprint.render_as_hash(category)
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    category = current_restaurant.categories.find(params[:id])
    category.destroy!
    head :no_content
  end

  private

  def category_params
    params.require(:category).permit(:name, :position, :active)
  end
end
