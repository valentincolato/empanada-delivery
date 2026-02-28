require "rails_helper"

RSpec.describe "Api::V1::Public::Menus", type: :request do
  describe "GET /api/v1/public/menu/:slug" do
    it "returns restaurant and active categories with available products" do
      restaurant = create(:restaurant, slug: "el-hornero")
      active_category = create(:category, restaurant: restaurant, name: "Bebidas", active: true)
      inactive_category = create(:category, restaurant: restaurant, name: "Oculta", active: false)

      visible_product = create(:product, category: active_category, name: "Cerveza", available: true)
      _hidden_product = create(:product, category: active_category, name: "No Disponible", available: false)
      create(:product, category: inactive_category, name: "No Se Ve", available: true)

      get "/api/v1/public/menu/#{restaurant.slug}"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body.dig("restaurant", "name")).to eq(restaurant.name)
      expect(body.fetch("categories").size).to eq(1)
      expect(body.dig("categories", 0, "name")).to eq("Bebidas")
      expect(body.dig("categories", 0, "products").size).to eq(1)
      expect(body.dig("categories", 0, "products", 0, "name")).to eq(visible_product.name)
    end

    it "returns 404 for unknown slug" do
      get "/api/v1/public/menu/not-found"

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)).to include("error" => "Menu not found")
    end

    it "returns empty categories for restaurant without products" do
      restaurant = create(:restaurant, slug: "sin-productos")

      get "/api/v1/public/menu/#{restaurant.slug}"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.fetch("categories")).to eq([])
    end
  end
end
