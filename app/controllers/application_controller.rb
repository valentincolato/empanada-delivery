class ApplicationController < ActionController::Base
  def after_sign_in_path_for(resource)
    return panel_path if resource.is_a?(User)

    super
  end
end
