class Api::PlayersController < ApplicationController
  # GET /api/players
  def index
    @players = Player.all
    render json: {
      players: @players.as_json(only: [ :id, :name, :number ], include: {
        team: { only: [ :id, :name ] },
        position: { only: [ :id, :position_name ] }
      })
    }, status: :ok
  end

  # GET /api/players/:id
  def show
    @player = Player.find(params[:id])

    render json: {
      player: @player.as_json(only: [ :id, :name, :number, :weekly_position_rank, :weekly_flex_rank ], include: {
        team: { only: [ :id, :name ] },
        position: { only: [ :id, :position_name ] }
      })
    }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Player not found" }, status: :not_found
  end

  # POST /api/players
  def create
    @player = Player.new(player_params)

    if @player.save
      render json: {
        player: @player.as_json(only: [ :id, :name, :number, :weekly_position_rank, :weekly_flex_rank ], include: {
          team: { only: [ :id, :name ] },
          position: { only: [ :id, :position_name ] }
        })
      }, status: :created
    else
      render json: { errors: @player.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /api/players/:id
  def update
    @player = Player.find(params[:id])

    if @player.update(player_params)
      render json: {
        player: @player.as_json(only: [ :id, :name, :number, :weekly_position_rank, :weekly_flex_rank ], include: {
          team: { only: [ :id, :name ] },
          position: { only: [ :id, :position_name ] }
        })
      }, status: :ok
    else
      render json: { errors: @player.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Player not found" }, status: :not_found
  end

  # DELETE /api/players/:id
  def destroy
    @player = Player.find(params[:id])

    if @player.destroy
      head :no_content
    else
      render json: { errors: @player.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Player not found" }, status: :not_found
  end

  private
  def player_params
    params.permit(:name, :number, :team_id, :position_id, :weekly_position_rank, :weekly_flex_rank)
  end
end
