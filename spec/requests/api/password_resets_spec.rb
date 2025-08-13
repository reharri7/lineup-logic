# spec/requests/api/password_resets_spec.rb
require 'swagger_helper'

RSpec.describe 'api/password_resets', type: :request do
  path '/api/password_resets' do
    post('Request password reset email') do
      tags 'PasswordResets'
      consumes 'application/json'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        required: %w[email],
        properties: {
          email: { type: :string, format: :email, example: 'user@example.com' }
        }
      }

      response(200, 'password reset email sent when email exists') do
        let!(:user) { User.create!(username: 'jane', email: 'user@example.com', password: '', role: 'user') }
        let(:payload) { { email: 'user@example.com' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['message']).to be_present
        end
      end

      response(404, 'email not found') do
        let(:payload) { { email: 'unknown@example.com' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to eq('Email not found')
        end
      end
    end
  end

  path '/api/password_resets/{token}' do
    parameter name: :token, in: :path, type: :string, description: 'Password reset token'

    put('Reset password with token') do
      tags 'PasswordResets'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :payload, in: :body, schema: {
        type: :object,
        required: %w[password password_confirmation],
        properties: {
          password: { type: :string, minLength: 8, example: 'NewP@ssw0rd' },
          password_confirmation: { type: :string, example: 'NewP@ssw0rd' }
        }
      }

      response(200, 'password reset successfully') do
        let!(:user) do
          User.create!(username: 'jane', email: 'user2@example.com', password: '', role: 'user').tap do |u|
            u.generate_password_reset_token
          end
        end
        let(:token) { user.password_reset_token }
        let(:payload) { { password: '', password_confirmation: '' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['message']).to eq('Password has been reset successfully')
        end
      end

      response(422, 'invalid or expired token') do
        let(:token) { 'invalid-token' }
        let(:payload) { { password: '', password_confirmation: '' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to eq('Invalid or expired token')
        end
      end

      response(422, 'validation errors when passwords do not match') do
        let!(:user) do
          User.create!(username: 'john', email: 'user3@example.com', password: '', role: 'user').tap do |u|
            u.generate_password_reset_token
          end
        end
        let(:token) { user.password_reset_token }
        let(:payload) { { password: '', password_confirmation: '' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['errors']).to be_an(Array)
        end
      end
    end
  end
end
