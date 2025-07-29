# app/models/fantasy_team_player.rb
# This is a join table that connects players to fantasy teams
# Players can exist without being in a fantasy team
# Fantasy teams can add multiple players
class FantasyTeamPlayer < ApplicationRecord
  belongs_to :fantasy_team
  belongs_to :player

  # Ensure a player can only be added once to a fantasy team
  validates :player_id, uniqueness: { scope: :fantasy_team_id }
end
