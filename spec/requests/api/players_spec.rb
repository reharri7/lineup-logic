require 'swagger_helper'

RSpec.describe 'api/players', type: :request do
  path '/api/players' do
    post('create player') do
      tags 'Players'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]
      parameter name: :player, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string },
          number: { type: :integer },
          team_id: { type: :integer },
          position_id: { type: :integer },
          weekly_position_rank: { type: :integer, nullable: true },
          weekly_flex_rank: { type: :integer, nullable: true }
        },
        required: %w[name number team_id position_id]
      }
      response(201, 'created') do
        schema type: :object,
               properties: {
                 player: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string },
                     number: { type: :integer },
                     weekly_position_rank: { type: :integer, nullable: true },
                     weekly_flex_rank: { type: :integer, nullable: true },
                     team: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         name: { type: :string }
                       }
                     },
                     position: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         position_name: { type: :string }
                       }
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

    get('get players') do
      tags 'Players'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]
      parameter name: :page, in: :query, type: :integer, required: false, description: 'Page number'
      parameter name: :size, in: :query, type: :integer, required: false, description: 'Number of items per page'
      parameter name: :name_filter, in: :query, type: :string, required: false, description: 'Name to filter by'
      parameter name: :number_filter, in: :query, type: :integer, required: false, description: 'Number to filter by'
      parameter name: :team_id, in: :query, type: :integer, required: false, description: 'Team ID to filter by'
      parameter name: :position_id, in: :query, type: :integer, required: false, description: 'Position ID to filter by'
      parameter name: :sort_by, in: :query, type: :string, required: false, description: 'Field to sort by (name, number, team_id, position_id)'
      parameter name: :sort_direction, in: :query, type: :string, required: false, description: 'Sort direction (asc, desc)'

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 players: {
                   type: :array,
                   items: {
                     type: :object,
                     properties: {
                       id: { type: :integer },
                       name: { type: :string },
                       number: { type: :integer },
                       team: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           name: { type: :string }
                         }
                       },
                       position: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           position_name: { type: :string }
                         }
                       }
                     }
                   }
                 },
               meta: {
                type: :object,
                properties: {
                  current_page: { type: :integer },
                  total_pages: { type: :integer },
                  total_count: { type: :integer },
                  size: { type: :integer }
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

  path '/api/players/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'player id'

    get('get player by id') do
      tags 'Players'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 player: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string },
                     number: { type: :integer },
                     weekly_position_rank: { type: :integer, nullable: true },
                     weekly_flex_rank: { type: :integer, nullable: true },
                     team: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         name: { type: :string }
                       }
                     },
                     position: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         position_name: { type: :string }
                       }
                     }
                   }
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

    put('update player') do
      tags 'Players'
      consumes 'application/json'
      produces 'application/json'
      security [ bearerAuth: [] ]

      parameter name: :player, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string },
          number: { type: :integer },
          team_id: { type: :integer },
          position_id: { type: :integer },
          weekly_position_rank: { type: :integer, nullable: true },
          weekly_flex_rank: { type: :integer, nullable: true }
        }
      }

      response(200, 'successful') do
        schema type: :object,
               properties: {
                 player: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string },
                     number: { type: :integer },
                     weekly_position_rank: { type: :integer, nullable: true },
                     weekly_flex_rank: { type: :integer, nullable: true },
                     team: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         name: { type: :string }
                       }
                     },
                     position: {
                       type: :object,
                       properties: {
                         id: { type: :integer },
                         position_name: { type: :string }
                       }
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

      response(404, 'not found') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }
        run_test!
      end
    end

    delete('delete player') do
      tags 'Players'
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
