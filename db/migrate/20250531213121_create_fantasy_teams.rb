class CreateFantasyTeams < ActiveRecord::Migration[8.0]
  def change
    create_table :fantasy_teams do |t|
      t.string :name
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
