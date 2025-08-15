# spec/requests/api/support_tickets_spec.rb
require 'swagger_helper'

RSpec.describe 'api/support_tickets', type: :request do
  path '/api/support_tickets' do
    post('create support ticket') do
      tags 'SupportTickets'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :support_ticket, in: :body, schema: {
        type: :object,
        required: %w[reply_to message],
        properties: {
          reply_to: { type: :string, format: :email, example: 'user@example.com' },
          message: { type: :string, example: 'I need help with my lineup.' },
          honeypot: { type: :string, description: 'Leave blank (spam honeypot). Hidden field.' }
        }
      }

      response(201, 'created') do
        before { ENV['SUPPORT_EMAIL'] = 'support@example.com' }
        let(:support_ticket) { { reply_to: 'user@example.com', message: 'Help!' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['id']).to be_present
          expect(data['reply_to']).to eq('user@example.com')
          expect(data['message']).to eq('Help!')
          expect(data['resolved']).to eq(false)
        end
      end

      response(422, 'validation errors') do
        let(:support_ticket) { { reply_to: 'bad-email', message: '' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_an(Array)
        end
      end

    end
  end

  path '/api/support_tickets' do
    get('list support tickets') do
      tags 'SupportTickets'
      produces 'application/json'
      security [ bearer_auth: [] ]

      parameter name: :resolved, in: :query, schema: { type: :boolean }, description: 'Filter by resolved status'

      response(200, 'successful') do
        let!(:user) { User.create!(username: 'admin', email: 'admin@example.com', password: 'password123', role: 'user').tap { |u| u.generate_auth_token } }
        let(:Authorization) { "Bearer #{user.auth_token}" }
        let(:resolved) { nil }
        before do
          SupportTicket.create!(reply_to: 'a@example.com', message: 'Hi')
          SupportTicket.create!(reply_to: 'b@example.com', message: 'Hello', resolved: true, resolved_at: Time.current)
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data).to be_an(Array)
        end
      end

      response(401, 'unauthorized') do
        let(:Authorization) { nil }
        let(:resolved) { nil }
        run_test!
      end
    end
  end

  path '/api/support_tickets/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'SupportTicket ID'

    patch('update support ticket') do
      tags 'SupportTickets'
      consumes 'application/json'
      produces 'application/json'
      security [ bearer_auth: [] ]

      parameter name: :support_ticket, in: :body, schema: {
        type: :object,
        required: %w[resolved],
        properties: {
          resolved: { type: :boolean }
        }
      }

      response(200, 'updated') do
        let!(:user) { User.create!(username: 'mod', email: 'mod@example.com', password: 'password123', role: 'user').tap { |u| u.generate_auth_token } }
        let(:Authorization) { "Bearer #{user.auth_token}" }
        let!(:ticket) { SupportTicket.create!(reply_to: 'c@example.com', message: 'Help me') }
        let(:id) { ticket.id }
        let(:support_ticket) { { resolved: true } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['resolved']).to eq(true)
          expect(data['resolved_at']).to be_present
        end
      end

      response(404, 'not found') do
        let!(:user) { User.create!(username: 'mod2', email: 'mod2@example.com', password: 'password123', role: 'user').tap { |u| u.generate_auth_token } }
        let(:Authorization) { "Bearer #{user.auth_token}" }
        let(:id) { 999_999 }
        let(:support_ticket) { { resolved: true } }
        run_test!
      end

      response(401, 'unauthorized') do
        let(:Authorization) { nil }
        let(:id) { 1 }
        let(:support_ticket) { { resolved: true } }
        run_test!
      end
    end
  end
end
