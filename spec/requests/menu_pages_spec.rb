require "rails_helper"

RSpec.describe "Menu pages", type: :request do
  describe "GET /:slug" do
    it "renders the menu react shell" do
      restaurant = create(:restaurant, slug: "parrilla-hornero")

      get "/#{restaurant.slug}"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("data-react-component=\"Menu\"")
      expect(response.body).to include("parrilla-hornero")
    end

    it "returns 404 when restaurant is inactive" do
      restaurant = create(:restaurant, active: false, slug: "closed-resto")

      get "/#{restaurant.slug}"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /r/:slug" do
    it "redirects to the canonical short URL" do
      restaurant = create(:restaurant, slug: "el-hornero")

      get "/r/#{restaurant.slug}"

      expect(response).to have_http_status(:moved_permanently)
      expect(response).to redirect_to("/#{restaurant.slug}")
    end
  end

  describe "GET /menu/:slug" do
    it "is an alias to the same menu page" do
      restaurant = create(:restaurant, slug: "el-hornero")

      get "/menu/#{restaurant.slug}"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("data-react-component=\"Menu\"")
      expect(response.body).to include("el-hornero")
    end
  end
end
