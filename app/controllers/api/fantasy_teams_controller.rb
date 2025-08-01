  # app/controllers/api/fantasy_teams_controller.rb
  class Api::FantasyTeamsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_fantasy_team, only: [ :show, :update, :destroy ]
    before_action :authorize_user!, only: [ :show, :update, :destroy ]

    # GET /api/fantasy_teams
    def index
      @fantasy_teams = current_user.fantasy_teams
      render json: { fantasy_teams: @fantasy_teams }
    end

    # GET /api/fantasy_teams/:id
    def show
      render json: {
        fantasy_team: @fantasy_team,
        players: @fantasy_team.players
      }
    end

    # POST /api/fantasy_teams
    def create
      @fantasy_team = current_user.fantasy_teams.build(fantasy_team_params)

      if @fantasy_team.save
        render json: { fantasy_team: @fantasy_team }, status: :created
      else
          render json: { errors: @fantasy_team.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/fantasy_teams/:id
    def update
      if @fantasy_team.update(fantasy_team_params)
        render json: { fantasy_team: @fantasy_team }
      else
        render json: { errors: @fantasy_team.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/fantasy_teams/:id
    def destroy
      @fantasy_team.destroy
      head :no_content
    end

    private

    def set_fantasy_team
      @fantasy_team = FantasyTeam.find(params[:id])
    end

    def authorize_user!
      unless @fantasy_team.user_id == current_user.id
        render json: { error: "You are not authorized to perform this action" }, status: :forbidden
      end
    end

    def fantasy_team_params
      params.require(:fantasy_team).permit(:name)
    end
  end
