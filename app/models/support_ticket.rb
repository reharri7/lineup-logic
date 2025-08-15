class SupportTicket < ApplicationRecord
  # Validations
  validates :reply_to, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :message, presence: true, length: { maximum: 10_000 }

  # Ensure resolved_at reflects the resolved flag changes
  before_save :sync_resolved_at

  private

  def sync_resolved_at
    if will_save_change_to_resolved?
      self.resolved_at = resolved? ? Time.current : nil
    end
  end
end
