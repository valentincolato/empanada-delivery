Rails.application.routes.draw do
  devise_for :users, skip: [ :registrations ]
  devise_scope :user do
    get "/panel/login", to: "devise/sessions#new", as: :panel_login
  end
  get "/panel", to: "panel#index", as: :panel

  get "up" => "rails/health#show", as: :rails_health_check

  # Public pages (React shell)
  get "/home", to: "home#index", as: :home
  get "/r/:slug", to: "menu#show", as: :menu
  get "/menu/:slug", to: "menu#show", as: :public_menu
  get "/orders/:token", to: "order_status#show", as: :order_status

  # Admin pages (React shell)
  get "/admin", to: "admin/dashboard#index"
  get "/admin/orders", to: "admin/dashboard#orders"
  get "/admin/products", to: "admin/dashboard#products"
  get "/admin/categories", to: "admin/dashboard#categories"
  get "/admin/qr", to: "admin/dashboard#qr"
  get "/admin/members", to: "admin/dashboard#members"

  # Super admin pages
  get "/super_admin", to: "super_admin/dashboard#index"
  get "/super_admin/restaurants", to: "super_admin/dashboard#restaurants"

  namespace :api do
    namespace :v1 do
      # Public
      namespace :public do
        get "menu/:slug", to: "menus#show", as: :menu
      end

      # Customer-facing orders
      resources :orders, only: %i[create show], param: :token

      # Restaurant admin
      namespace :admin do
        resources :orders, only: %i[index show update]
        resources :products
        resources :categories
        resources :memberships, only: %i[index create update destroy]
        post "switch_restaurant", to: "contexts#switch"
        delete "clear_restaurant", to: "contexts#clear"
        resource :restaurant, only: %i[show update] do
          post :toggle_accepting_orders
          get :qr_code
        end
      end

      # Super admin
      namespace :super_admin do
        resources :restaurants do
          post :switch_context, on: :member
          delete :clear_context, on: :collection
        end
      end
    end
  end

  # Restaurant page
  get "/:restaurant_name", to: "menu#show", as: :restaurant_page, constraints: {
    restaurant_name: /[a-z0-9-]+/
  }

  root to: "home#index"
end
