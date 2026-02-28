class BaseAction
  include ActiveModel::Validations

  Result = Struct.new(:success, :value, keyword_init: true) do
    def success? = success
    def failure? = !success
  end

  class FailError < StandardError
    attr_reader :value
    def initialize(value) = (@value = value; super(value.to_s))
  end

  def self.call(**kwargs)
    action = new(**kwargs)
    action.run_validations_and_perform
  end

  def initialize(**kwargs)
    kwargs.each { |k, v| public_send(:"#{k}=", v) }
    setup if respond_to?(:setup, true)
  end

  def run_validations_and_perform
    return failure!(errors.full_messages.join(", ")) unless valid?
    perform
  rescue FailError => e
    Result.new(success: false, value: e.value)
  end

  private

  def perform
    raise NotImplementedError, "#{self.class} must implement #perform"
  end

  def success!(value = nil)
    Result.new(success: true, value: value)
  end

  def fail!(value)
    raise FailError, value
  end

  def failure!(value)
    Result.new(success: false, value: value)
  end
end
