class SupportTicketMailer < ApplicationMailer
  # Sends a notification to the support inbox when a new ticket is created.
  # Reply-To is set to the submitter's email so support can reply directly.
  #
  # @param ticket [SupportTicket]
  def notify_support(ticket)
    @ticket = ticket
    support_email = ENV["SUPPORT_EMAIL"] || raise("Missing ENV['SUPPORT_EMAIL'] for SupportTicketMailer")

    mail(
      to: support_email,
      subject: "New Support Ticket",
      reply_to: @ticket.reply_to
    )
  end
end
