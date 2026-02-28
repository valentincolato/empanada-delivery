module ComponentsHelper
  def component(name, props = {})
    payload = props.merge(frontend_routes)

    tag.div(
      "",
      data: {
        react_component: name,
        props: payload.to_json
      }
    )
  end

  private

  def frontend_routes
    {
      panel_login: panel_login_path,
      panel: panel_path,
      admin_orders: admin_orders_path,
      admin_products: admin_products_path,
      admin_categories: admin_categories_path,
      admin_qr: admin_qr_path,
      admin_members: admin_members_path,
      super_admin_restaurants: super_admin_restaurants_path,
      public_restaurant_template: restaurant_page_path(slug: "slug-placeholder").sub("slug-placeholder", ":slug"),
      order_status_template: order_status_path(token: "token-placeholder").sub("token-placeholder", ":token"),
      api_orders: api_v1_orders_path,
      api_order_status_template: api_v1_order_path(token: "token-placeholder").sub("token-placeholder", ":token"),
      api_public_menu_template: api_v1_public_menu_path(slug: "slug-placeholder").sub("slug-placeholder", ":slug"),
      api_admin_orders: api_v1_admin_orders_path,
      api_admin_order_template: api_v1_admin_order_path(id: "id-placeholder").sub("id-placeholder", ":id"),
      api_admin_products: api_v1_admin_products_path,
      api_admin_product_template: api_v1_admin_product_path(id: "id-placeholder").sub("id-placeholder", ":id"),
      api_admin_categories: api_v1_admin_categories_path,
      api_admin_category_template: api_v1_admin_category_path(id: "id-placeholder").sub("id-placeholder", ":id"),
      api_admin_memberships: api_v1_admin_memberships_path,
      api_admin_membership_template: api_v1_admin_membership_path(id: "id-placeholder").sub("id-placeholder", ":id"),
      api_admin_switch_restaurant: api_v1_admin_switch_restaurant_path,
      api_admin_restaurant: api_v1_admin_restaurant_path,
      api_admin_restaurant_toggle_accepting_orders: toggle_accepting_orders_api_v1_admin_restaurant_path,
      api_admin_restaurant_qr_code: qr_code_api_v1_admin_restaurant_path,
      api_super_admin_restaurants: api_v1_super_admin_restaurants_path,
      api_super_admin_restaurant_template: api_v1_super_admin_restaurant_path(id: "id-placeholder").sub("id-placeholder", ":id"),
      api_super_admin_restaurant_switch_context_template: switch_context_api_v1_super_admin_restaurant_path(id: "id-placeholder").sub("id-placeholder", ":id"),
      api_super_admin_restaurants_clear_context: clear_context_api_v1_super_admin_restaurants_path
    }
  end
end
