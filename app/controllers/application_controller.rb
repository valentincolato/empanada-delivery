class ApplicationController < ActionController::Base
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError, with: :pundit_forbidden

  def after_sign_in_path_for(resource)
    return panel_path if resource.is_a?(User)

    super
  end

  private

  def pundit_forbidden
    respond_to do |format|
      format.json { render json: { error: "Forbidden" }, status: :forbidden }
      format.html { redirect_to panel_path, alert: "Acceso denegado." }
    end
  end
end
