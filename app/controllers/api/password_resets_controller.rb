# app/controllers/api/password_resets_controller.rb
class Api::PasswordResetsController < ApplicationController
  skip_before_action :authenticate_request

  # POST /api/password_resets
  def create
    @user = User.find_by(email: params[:email])

    if @user
      @user.generate_password_reset_token
      PasswordResetMailer.reset_password_email(@user).deliver_now
      render json: { message: "Password reset instructions sent to your email" }, status: :ok
    else
      render json: { error: "Email not found"}, status: :not_found
    end
  end

  # PUT /api/password_resets_controller/:token
  def update
    @user = User.find_by(password_reset_token: params[:token])

    if @user && @user.password_reset_token_valid?
      if @user.update(password_params)
        @user.clear_password_reset_token
        render json: { message: "Password has been reset successfully" }, status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: "Invalid or expired token"}, status: :unprocessable_entity
    end
  end

  def password_params
    params.permit(:password, :password_confirmation)
  end

end