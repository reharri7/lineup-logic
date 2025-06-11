require 'swagger_helper'

RSpec.describe 'api/authentication', type: :request do
  path '/api/auth/login' do
    post('login user') do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_credentials, in: :body, schema: {
        type: :object,
        properties: {
          email: { type: :string, example: 'user@example.com' },
          password: { type: :string, example: 'password123' }
        },
        required: %w[email password]
      }

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 token: { type: :string },
                 user: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     email: { type: :string }
                   }
                 }
               }
        run_test!
      end

      response(401, 'unauthorized') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }
        run_test!
      end
    end
    path '/api/auth/logout' do
      delete('logout user') do
        tags 'Authentication'
        consumes 'application/json'
        produces 'application/json'
        security [ { bearerAuth: [] } ]

        parameter name: :Authorization, in: :header, type: :string, required: true, description: 'Bearer token', example: 'Bearer your_auth_token_here'

        response(200, 'successful logout') do
          schema type: :object,
                 properties: {
                   message: { type: :string, example: 'Successfully logged out' }
                 }
          run_test!
        end

        response(401, 'unauthorized - invalid or missing token') do
          schema type: :object,
                 properties: {
                   error: { type: :string }
                 }
          run_test!
        end

      end
    end
  end
end
