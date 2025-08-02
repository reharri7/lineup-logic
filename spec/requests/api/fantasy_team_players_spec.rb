require 'swagger_helper'

RSpec.describe 'Fantasy Team Players API', type: :request do
  path '/api/fantasy_teams/{fantasy_team_id}/players' do
    parameter name: :fantasy_team_id, in: :path, type: :integer

    post 'Adds a player to a fantasy team' do
      tags 'Fantasy Team Players'
      security [ { bearer_auth: [] } ]
      consumes 'application/json'
      produces 'application/json'
      parameter name: :player, in: :body, schema: {
        type: :object,
        properties: {
          player: {
            type: :object,
            properties: {
              player_id: { type: :integer }
            },
            required: [ 'player_id' ]
          }
        }
      }

      response '201', 'player added to fantasy team' do
        schema type: :object,
          properties: {
            fantasy_team_player: {
              type: :object,
              properties: {
                id: { type: :integer },
                fantasy_team_id: { type: :integer },
                player_id: { type: :integer },
                created_at: { type: :string, format: 'date-time' },
                updated_at: { type: :string, format: 'date-time' }
              }
            },
            player: {
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
  end

  path '/api/fantasy_teams/{fantasy_team_id}/players/{id}' do
    parameter name: :fantasy_team_id, in: :path, type: :integer
    parameter name: :id, in: :path, type: :integer

    delete 'Removes a player from a fantasy team' do
      tags 'Fantasy Team Players'
      security [ { bearer_auth: [] } ]
      produces 'application/json'

      response '204', 'player removed from fantasy team' do
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
