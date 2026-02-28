class MenuController < ApplicationController
  def show
    @restaurant = Restaurant.active.find_by!(slug: params[:slug])
  rescue ActiveRecord::RecordNotFound
    render file: "public/404.html", status: :not_found
  end
end
