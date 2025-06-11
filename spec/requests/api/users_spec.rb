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

    post('create user') do
      tags 'Users'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          email: { type: :string },
          password: { type: :string }
        },
        required: %w[email password]
      }

      response(201, 'created') do
        schema type: :object,
               properties: {
                 id: { type: :integer },
                 email: { type: :string }
               }
        run_test!
      end
    end
  end
end
