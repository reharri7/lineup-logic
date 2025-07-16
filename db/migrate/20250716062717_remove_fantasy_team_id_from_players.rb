class RemoveFantasyTeamIdFromPlayers < ActiveRecord::Migration[8.0]
  def change
    remove_column :players, :fantasy_team_id, :integer
  end
end
