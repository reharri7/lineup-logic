class User < ApplicationRecord
  has_many :fantasy_teams

  has_secure_password

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true

  # Token expiration duration (24 hours)
  TOKEN_EXPIRATION_TIME = 24.hours

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
end
