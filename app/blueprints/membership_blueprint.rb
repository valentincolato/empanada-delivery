class MembershipBlueprint < Blueprinter::Base
  identifier :id
  field :role
  association :user, blueprint: UserBlueprint
end
