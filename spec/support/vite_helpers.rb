module ViteTestHelpers
  def vite_client_tag(*_args)
    "".html_safe
  end

  def vite_javascript_tag(*_args)
    "".html_safe
  end
end

RSpec.configure do |config|
  config.before(:each, type: :request) do
    ActionView::Base.prepend(ViteTestHelpers)
  end
end
