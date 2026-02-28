module Restaurants
  class GenerateQrAction < BaseAction
    attr_accessor :restaurant, :base_url

    validates_presence_of :restaurant, :base_url

    def perform
      menu_url = "#{base_url}/#{restaurant.slug}"
      qr = RQRCode::QRCode.new(menu_url)
      svg = qr.as_svg(
        offset: 0,
        color: "000",
        shape_rendering: "crispEdges",
        module_size: 6,
        standalone: true
      )
      success!({ svg: svg, url: menu_url })
    end
  end
end
