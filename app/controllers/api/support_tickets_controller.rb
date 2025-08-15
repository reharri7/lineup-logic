# app/controllers/api/support_tickets_controller.rb
class Api::SupportTicketsController < ApplicationController
  # Public create endpoint; listing and updating require authentication via ApplicationController
  skip_before_action :authenticate_request, only: [ :create ]

  # POST /api/support_tickets
  def create
    # Simple honeypot spam mitigation: if hidden field provided, accept without processing
    # Note: Using fetch chain with rescue to handle string/symbol keys and missing nesting
    honeypot_value = begin
      (params[:support_ticket] || params["support_ticket"])&.[](:honeypot) || (params[:support_ticket] || params["support_ticket"])&.[]("honeypot")
    rescue
      nil
    end
    if honeypot_value.present?
      return render json: { message: "Request accepted" }, status: :accepted
    end

    ticket = SupportTicket.new(create_params)

    if ticket.save
      # Keep synchronous delivery consistent with existing PasswordResetMailer usage
      SupportTicketMailer.notify_support(ticket).deliver_now
      render json: serialize(ticket), status: :created
    else
      render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/support_tickets
  # Optional filter: ?resolved=true|false
  def index
    scope = SupportTicket.order(created_at: :desc)

    if params.key?(:resolved)
      resolved_bool = ActiveModel::Type::Boolean.new.cast(params[:resolved])
      scope = scope.where(resolved: resolved_bool)
    end

    render json: scope.map { |t| serialize(t) }
  end

  # PATCH /api/support_tickets/:id
  def update
    ticket = SupportTicket.find(params[:id])

    if ticket.update(update_params)
      render json: serialize(ticket), status: :ok
    else
      render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Support ticket not found" }, status: :not_found
  end

  private

  def create_params
    params.require(:support_ticket).permit(:reply_to, :message)
  end

  def update_params
    params.require(:support_ticket).permit(:resolved)
  end

  def serialize(ticket)
    ticket.as_json(only: [ :id, :reply_to, :message, :resolved, :resolved_at, :created_at, :updated_at ])
  end
end
