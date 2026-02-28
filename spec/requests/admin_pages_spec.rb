require "rails_helper"

RSpec.describe "Admin pages", type: :request do
  describe "GET /admin/*" do
    [
      "/admin",
      "/admin/orders",
      "/admin/products",
      "/admin/categories",
      "/admin/qr",
      "/admin/members"
    ].each do |path|
      it "redirects unauthenticated users from #{path} to /panel/login" do
        get path

        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(panel_login_path)
      end
    end
  end
end
