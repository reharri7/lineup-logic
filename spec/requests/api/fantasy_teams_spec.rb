require 'swagger_helper'

RSpec.describe 'Fantasy Teams API', type: :request do
  path '/api/fantasy_teams' do
    get 'Retrieves all fantasy teams for the current user' do
      tags 'Fantasy Teams'
      security [{ bearer_auth: [] }]
      produces 'application/json'

      response '200', 'fantasy teams found' do
        schema type: :object,
          properties: {
            fantasy_teams: {
              type: :array,
              items: {
                type: :object,
                properties: {
                  id: { type: :integer },
                  name: { type: :string },
                  user_id: { type: :integer },
                  created_at: { type: :string, format: 'date-time' },
                  updated_at: { type: :string, format: 'date-time' }
                }
              }
            }
          }
        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/unauthorized'
        run_test!
      end
    end

    post 'Creates a fantasy team' do
      tags 'Fantasy Teams'
      security [{ bearer_auth: [] }]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :fantasy_team, in: :body, schema: {
        type: :object,
        properties: {
          fantasy_team: {
            type: :object,
            properties: {
              name: { type: :string }
            },
            required: ['name']
          }
        }
      }

      response '201', 'fantasy team created' do
        schema type: :object,
          properties: {
            fantasy_team: {
              type: :object,
              properties: {
                id: { type: :integer },
                name: { type: :string },
                user_id: { type: :integer },
                created_at: { type: :string, format: 'date-time' },
                updated_at: { type: :string, format: 'date-time' }
              }
            }
          }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/errors'
        run_test!
      end
    end
  end

  path '/api/fantasy_teams/{id}' do
    parameter name: :id, in: :path, type: :integer

    get 'Retrieves a fantasy team' do
      tags 'Fantasy Teams'
      security [{ bearer_auth: [] }]
      produces 'application/json'

      response '200', 'fantasy team found' do
        schema type: :object,
          properties: {
            fantasy_team: {
              type: :object,
              properties: {
                id: { type: :integer },
                name: { type: :string },
                user_id: { type: :integer },
                created_at: { type: :string, format: 'date-time' },
                updated_at: { type: :string, format: 'date-time' }
              }
            },
            players: {
              type: :array,
              items: {
                type: :object,
                properties: {
                  id: { type: :integer },
                  name: { type: :string },
                  number: { type: :integer },
                  team_id: { type: :integer },
                  position_id: { type: :integer },
                  weekly_position_rank: { type: :integer, nullable: true },
                  weekly_flex_rank: { type: :integer, nullable: true },
                  created_at: { type: :string, format: 'date-time' },
                  updated_at: { type: :string, format: 'date-time' }
                }
              }
            }
          }
        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/unauthorized'
        run_test!
      end

      response '403', 'forbidden' do
        schema '$ref' => '#/components/schemas/forbidden'
        run_test!
      end

      response '404', 'not found' do
        schema '$ref' => '#/components/schemas/not_found'
        run_test!
      end
    end

    put 'Updates a fantasy team' do
      tags 'Fantasy Teams'
      security [{ bearer_auth: [] }]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :fantasy_team, in: :body, schema: {
        type: :object,
        properties: {
          fantasy_team: {
            type: :object,
            properties: {
              name: { type: :string }
            },
            required: ['name']
          }
        }
      }

      response '200', 'fantasy team updated' do
        schema type: :object,
          properties: {
            fantasy_team: {
              type: :object,
              properties: {
                id: { type: :integer },
                name: { type: :string },
                user_id: { type: :integer },
                created_at: { type: :string, format: 'date-time' },
                updated_at: { type: :string, format: 'date-time' }
              }
            }
          }
        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/unauthorized'
        run_test!
      end

      response '403', 'forbidden' do
        schema '$ref' => '#/components/schemas/forbidden'
        run_test!
      end

      response '404', 'not found' do
        schema '$ref' => '#/components/schemas/not_found'
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/errors'
        run_test!
      end
    end

    delete 'Deletes a fantasy team' do
      tags 'Fantasy Teams'
      security [{ bearer_auth: [] }]
      produces 'application/json'

      response '204', 'fantasy team deleted' do
        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/unauthorized'
        run_test!
      end

      response '403', 'forbidden' do
        schema '$ref' => '#/components/schemas/forbidden'
        run_test!
      end

      response '404', 'not found' do
        schema '$ref' => '#/components/schemas/not_found'
        run_test!
      end
    end
  end
end