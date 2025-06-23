class Api::PositionsController < ApplicationController
  # GET /api/positions
  def index
    @positions = Position.all
    render json: {
      positions: @positions.as_json(only: [ :id, :name ])
    }, status: :ok
  end

  # Get /api/positions/:id
  def show
    @position = Position.find(params[:id])

    render json: {
      position: @position.as_json(only: [ :id, :name ])
    }, status: :ok

  rescue ActiveRecord::RecordNotFound
    render json: { error: "Position not found" }, status: :not_found
  end

  # POST /api/positions
  def create
    @position = Position.new(position_params)

    if @position.save
      render json: {
        position: @position.as_json(only: [ :id, :name ])
      }, status: :created
    else
      render json: { errors: @position.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /api/positions/:id
  def update
    @position = Position.find(params[:id])

    if @position.update(position_params)
      render json: {
        position: @position.as_json(only: [ :id, :name ])
      }, status: :ok
    else
      render json: {
        errors: @position.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/positions/:id
  def destroy
    @position = Position.find(params[:id])

    if @position.destroy
      head :no_content
    else
      render json: { errors: @position.errors.full_messages }
    end
  end

  private

  def position_params
    params.permit(:name)
  end
end
