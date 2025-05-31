class FantasyTeam < ApplicationRecord
  belongs_to :user
  has_many :fantasy_team_players
  has_many :players, through: :fantasy_team_players

  validates :name, presence: true
end