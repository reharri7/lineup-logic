# app/models/fantasy_team_player.rb
class FantasyTeamPlayer < ApplicationRecord
  belongs_to :fantasy_team
  belongs_to :player
end
