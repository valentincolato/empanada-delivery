class OrderStatusController < ApplicationController
  def show
    @order = Order.find_by!(token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render file: "public/404.html", status: :not_found
  end
end
