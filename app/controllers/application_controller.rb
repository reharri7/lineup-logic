class ApplicationController < ActionController::API
  before_action :authenticate_request

  attr_reader :current_user

  private

  def authenticate_request
    @current_user = find_user_by_token

    if @current_user.nil?
      render json: { error: "Not authorized" }, status: :unauthorized

    elsif !@current_user.token_valid?
      render json: { error: "Token expired" }, status: :unauthorized
    end
  end

  def find_user_by_token
    auth_header = request.headers["Authorization"]
    if auth_header
      token = auth_header.split(" ").last
      User.find_by_valid_token(token)
    end
  end
end
