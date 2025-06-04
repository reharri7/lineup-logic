class Api::UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [ :create ]

  # POST /api/signup
  def create
    @user = User.new(user_params)
    @user.role = 'user' # Set default role explicitly

    if @user.save
      @user.generate_auth_token

      render json: {
        user: @user.as_json(only: [ :id, :username, :email, :role ]),
        token: @user.auth_token,
        expires_at: @user.token_expires_at.iso8601
      }, status: :created

    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :email, :password, :password_confirmation)
  end
end
