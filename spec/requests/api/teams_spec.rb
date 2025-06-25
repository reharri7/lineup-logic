require 'swagger_helper'

RSpec.describe 'api/teams', type: :request do
  path '/api/teams' do
    post('create team') do
      tags 'Teams'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      parameter name: :team, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string }
        },
        required: %w[name]
      }

      response(201, 'created') do
        schema type: :object,
               properties: {
                 team: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string }
                   }
                 }
               }
        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
               properties: {
                 errors: {
                   type: :array,
                   items: { type: :string }
                 }
               }
        run_test!
      end
    end
  end

  path '/api/teams/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'team id'

    put('update team') do
      tags 'Teams'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      parameter name: :team, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string }
        },
        required: %w[name]
      }

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 team: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string }
                   }
                 }
               }
        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
               properties: {
                 errors: {
                   type: :array,
                   items: { type: :string }
                 }
               }
        run_test!
      end

      response(404, 'not found') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }
        run_test!
      end
    end

    delete('delete team') do
      tags 'Teams'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(204, 'no content') do
        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
               properties: {
                 errors: {
                   type: :array,
                   items: { type: :string }
                 }
               }
        run_test!
      end

      response(404, 'not found') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }
        run_test!
      end
    end
  end

path '/api/teams/' do
    get('get teams') do
      tags 'Teams'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 team: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string }
                   }
                 }
               }
        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
               properties: {
                 errors: {
                   type: :array,
                   items: { type: :string }
                 }
               }
        run_test!
      end
    end
  end

  path '/api/teams/{id}' do
      get('get team by id') do
        tags 'Teams'
        consumes 'application/json'
        produces 'application/json'
        security [ bearerAuth: [] ]

        response(200, 'successful') do
          schema type: :object,
                 properties: {
                   team: {
                     type: :object,
                     properties: {
                       id: { type: :integer },
                       name: { type: :string }
                     }
                   }
                 }
          run_test!
        end

        response(422, 'unprocessable entity') do
          schema type: :object,
                 properties: {
                   errors: {
                     type: :array,
                     items: { type: :string }
                   }
                 }
          run_test!
        end
      end

    delete('delete team') do
      tags 'Teams'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(204, 'no content') do
        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
               properties: {
                 errors: {
                   type: :array,
                   items: { type: :string }
                 }
               }
        run_test!
      end

      response(404, 'not found') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }
        run_test!
      end
    end
  end
end
