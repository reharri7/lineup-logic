class Api::TeamsController < ApplicationController
    # GET /api/teams
    def index
      @teams = Team.all
      render json: {
        teams: @teams.as_json(only: [ :id, :name ])
      }, status: :ok
  end

# GET /api/teams/:id
def show
  @team = Team.find(params[:id])

  render json: {
    team: @team.as_json(only: [ :id, :name ])
  }, status: :ok
rescue ActiveRecord::RecordNotFound
  render json: { error: "Team not found" }, status: :not_found
end

    # POST /api/teams
    def create
        @team = Team.new(team_params)

        if @team.save
            render json: {
            team: @team.as_json(only: [ :id, :name ])
            }, status: :created

        else
            render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
        end
    end

    # PUT /api/teams/:id
    def update
        @team = Team.find(params[:id])

        if @team.update(team_params)
            render json: {
                team: @team.as_json(only: [ :id, :name ])
            }, status: :ok
        else
            render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
        end
    end

    # DELETE /api/teams/:id
    def destroy
        @team = Team.find(params[:id])

        if @team.destroy
            head :no_content
        else
            render json: { errors: @team.errors.full_messages }, status: :unprocessable_entity
        end
    end

    private def team_params
        params.permit(:name)
    end
end
