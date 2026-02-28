class Api::V1::Admin::MembershipsController < Api::V1::Admin::BaseController
  def index
    authorize RestaurantMembership, :index?
    memberships = current_restaurant.restaurant_memberships.includes(:user)
    render json: MembershipBlueprint.render_as_hash(memberships)
  end

  def create
    authorize RestaurantMembership, :create?

    membership_attrs = params.require(:membership).permit(:email, :role, :name)

    user = User.find_or_initialize_by(email: membership_attrs[:email])
    if user.new_record?
      user.assign_attributes(
        password: SecureRandom.base58(24),
        name: membership_attrs[:name],
        role: :restaurant_admin
      )
      user.save!
    elsif user.customer?
      user.update!(role: :restaurant_admin)
    end

    membership = current_restaurant.restaurant_memberships.find_or_initialize_by(user: user)
    membership.update!(role: membership_attrs[:role])

    render json: MembershipBlueprint.render_as_hash(membership), status: :created
  end

  def update
    membership = current_restaurant.restaurant_memberships.find(params[:id])
    authorize membership

    membership.update!(role: params.require(:membership).require(:role))
    render json: MembershipBlueprint.render_as_hash(membership)
  end

  def destroy
    membership = current_restaurant.restaurant_memberships.find(params[:id])
    authorize membership

    if membership.user == current_user
      return render json: { error: "No podés eliminarte a vos mismo" }, status: :unprocessable_entity
    end

    membership.destroy!
    head :no_content
  end
end
