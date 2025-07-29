class Player < ApplicationRecord
  belongs_to :team
  belongs_to :position

  # Players can optionally be associated with fantasy teams
  # This is a lookup table that fantasy teams can reference
  has_many :fantasy_team_players, dependent: :destroy
  has_many :fantasy_teams, through: :fantasy_team_players

  validates :name, presence: true
  validates :number, presence: true, numericality: { only_integer: true }
  validates :weekly_position_rank, numericality: { only_integer: true, allow_nil: true }
  validates :weekly_flex_rank, numericality: { only_integer: true, allow_nil: true }
end
