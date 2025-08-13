class User < ApplicationRecord
  has_many :fantasy_teams

  has_secure_password

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true

  # Token expiration duration (24 hours)
  TOKEN_EXPIRATION_TIME = 24.hours

  # Password reset token expiration (1 hour)
  PASSWORD_RESET_EXPIRATION = 1.hour

  def generate_auth_token
    self.auth_token = SecureRandom.urlsafe_base64(32)
    self.token_expires_at = TOKEN_EXPIRATION_TIME.from_now
    save!
  end

  # Check if the token is still valid
  def token_valid?
    token_expires_at.present? && token_expires_at > Time.current
  end

  # Invalidate the token
  def invalidate_token
    update!(auth_token: nil, token_expires_at: nil)
  end

  # Find user by valid token
  def self.find_by_valid_token(token)
    user = find_by(auth_token: token)
    user if user&.token_valid?
  end

  def generate_password_reset_token
    self.password_reset_token = SecureRandom.urlsafe_base64(32)
    self.password_reset_token_expires_at = PASSWORD_RESET_EXPIRATION.from_now
    save!
  end

  def password_reset_token_valid?
    password_reset_token_expires_at.present? &&
    password_reset_token_expires_at > Time.current
  end

  def clear_password_reset_token
    update!(password_reset_token: nil, password_reset_token_expires_at: nil)
  end
end
