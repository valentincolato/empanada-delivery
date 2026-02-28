class MenuController < ApplicationController
  def show
    slug = params[:slug] || params[:restaurant_name]
    @restaurant = Restaurant.active.find_by!(slug: slug)
  rescue ActiveRecord::RecordNotFound
    render file: "public/404.html", status: :not_found
  end
end
