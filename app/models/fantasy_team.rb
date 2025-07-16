class FantasyTeam < ApplicationRecord
  belongs_to :user
  
  # Fantasy teams can have multiple players
  # Players are added to fantasy teams through the fantasy_team_players join table
  has_many :fantasy_team_players, dependent: :destroy
  has_many :players, through: :fantasy_team_players

  validates :name, presence: true
end
