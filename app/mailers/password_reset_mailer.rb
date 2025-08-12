class PasswordResetMailer < ApplicationMailer
  def reset_password_email(user)
    @user = user
    @reset_url = "#{ENV['FRONTEND_URL']}/reset-password/#{user.password_reset_token}"
    mail(to: @user.email, subject: "Password Reset Instructions")
  end
end
