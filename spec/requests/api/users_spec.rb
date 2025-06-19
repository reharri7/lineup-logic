require 'swagger_helper'

RSpec.describe 'api/users', type: :request do
  path '/api/users' do
    get('list users') do
      tags 'Users'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(200, 'successful') do
        schema type: :array,
               items: {
                 type: :object,
                 properties: {
                   id: { type: :integer },
                   email: { type: :string },
                   created_at: { type: :string, format: :datetime }
                 }
               }
        run_test!
      end
    end
  end

  path '/api/signup' do
    post('create user') do
      tags 'Users'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          username: { type: :string },
          email: { type: :string },
          password: { type: :string },
          password_confirmation: { type: :string }

        },
        required: %w[username email password password_confirmation] # Update this
      }

      response(201, 'created') do
        schema type: :object,
               properties: {
                 user: { 
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     username: { type: :string },
                     email: { type: :string },
                     role: { type: :string }
                   }
                 },
                 token: { type: :string },
                 expires_at: { type: :string, format: :datetime }
               }
        run_test!
      end
    end
  end
end
