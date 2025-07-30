class Api::PlayersController < ApplicationController
  # GET /api/players
  def index
    page = params[:page] || 1
    size = params[:size] || 25
    allowed_sort_columns = %w[name number team_id position_id]
    sort_by = allowed_sort_columns.include?(params[:sort_by]) ? params[:sort_by] : "name"
    sort_direction = %w[asc desc].include?(params[:sort_direction].to_s.downcase) ? params[:sort_direction].downcase : "asc"

    @players = Player.all

    @players = @players.where("name LIKE ?", "%#{params[:name_filter]}%") if params[:name_filter].present?
    @players = @players.where(number: params[:number_filter]) if params[:number_filter].present?
    @players = @players.where(team_id: params[:team_id]) if params[:team_id].present?
    @players = @players.where(position_id: params[:position_id]) if params[:position_id].present?

    @players = @players.order(sort_by => sort_direction)

    @players = @players.page(page).per(size)

    render json: {
      players: @players.as_json(only: [ :id, :name, :number ], include: {
        team: { only: [ :id, :name ] },
        position: { only: [ :id, :position_name ] }
      }),
      meta: {
        current_page: @players.current_page,
        total_pages: @players.total_pages,
        total_count: @players.total_count,
        size: @players.limit_value
      }
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
