require "rails_helper"

RSpec.describe "Authentication pages", type: :request do
  describe "GET /panel/login" do
    it "renders the branded login page" do
      get "/panel/login"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("QueResto")
      expect(response.body).to include("Welcome")
      expect(response.body).to include("E-mail")
      expect(response.body).to include("Password")
    end
  end

  describe "POST /users/sign_in" do
    let!(:user) { create(:user, email: "owner@example.com", password: "password123") }

    it "authenticates with valid credentials" do
      post "/users/sign_in", params: {
        user: {
          email: "owner@example.com",
          password: "password123"
        }
      }

      expect(response).to have_http_status(:see_other)
      expect(response).to redirect_to(root_path)
    end
  end
end
