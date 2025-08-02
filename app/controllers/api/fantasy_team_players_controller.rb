class Api::FantasyTeamPlayersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_fantasy_team
  before_action :authorize_user!
  before_action :set_fantasy_team_player, only: [ :destroy ]

  # POST /api/fantasy_teams/:fantasy_team_id/players
  def create
    @player = Player.find_by(id: player_params[:player_id])
    unless @player
      render json: { error: "Player not found" }, status: :not_found and return
    end
    @fantasy_team_player = @fantasy_team.fantasy_team_players.build(player: @player)

    if @fantasy_team_player.save
      render json: {
        fantasy_team_player: @fantasy_team_player,
        player: @player
      }, status: :created
    else
      render json: { errors: @fantasy_team_player.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/fantasy_teams/:fantasy_team_id/players/:id
  def destroy
    @fantasy_team_player.destroy
    head :no_content
  end

  private

  def set_fantasy_team
    @fantasy_team = FantasyTeam.find(params[:fantasy_team_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Fantasy team not found" }, status: :not_found
  end

  def set_fantasy_team_player
    @fantasy_team_player = @fantasy_team.fantasy_team_players.find(params[:id])
  end

  def authorize_user!
    unless @fantasy_team.user_id == current_user.id
      render json: { error: "You are not authorized to perform this action" }, status: :forbidden
    end
  end

  def player_params
    params.require(:player).permit(:player_id)
  end
end
