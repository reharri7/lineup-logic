require 'swagger_helper'

RSpec.describe 'api/positions', type: :request do
  path '/api/positions' do
    post('create position') do
      tags 'Positions'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      parameter name: :position, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string }
        },
        required: %w[name]
      }

      response(201, 'created') do
        schema type: :object,
               properties: {
                 position: {
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

  path '/api/positions/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'position id'

    get('get position by id') do
      tags 'Positions'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 position: {
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

    put('update position') do
      tags 'Positions'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      parameter name: :position, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string }
        },
        required: %w[name]
      }

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 position: {
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

    delete('delete position') do
      tags 'Positions'
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

  path '/api/positions/' do
    get('get positions') do
      tags 'Positions'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 positions: {
                   type: :array,
                   items: {
                     type: :object,
                     properties: {
                       id: { type: :integer },
                       name: { type: :string }
                     }
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
end
