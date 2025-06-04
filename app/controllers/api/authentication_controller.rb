
class Api::AuthenticationController < ApplicationController
  skip_before_action :authenticate_request, only: [ :login ]

  # POST /api/login
  def login
    @user = User.find_by(email: params[:email])

    if @user&.authenticate(params[:password])
      @user.generate_auth_token

      render json: {
        user: @user.as_json(only: [ :id, :username, :email, :role ]),
        token: @user.auth_token,
        expires_at: @user.token_expires_at
      }, status: :ok
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  # DELETE /api/logout
  def logout
    current_user.invalidate_token
    render json: { message: "Successfully logged out" }, status: :ok
  end

  # POST /api/refresh_token
  def refresh_token
    if current_user
      current_user.generate_auth_token
      render json: {
        token: current_user.auth_token,
        expires_at: current_user.token_expires_at.iso8601
      }, status: :ok

    else
      render json: { error: "Token expired or invalid" }, status: :unauthorized
    end
  end
end
