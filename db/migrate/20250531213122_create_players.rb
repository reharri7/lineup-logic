
class CreatePlayers < ActiveRecord::Migration[8.0]
  def change
    create_table :players do |t|
      t.string :name
      t.integer :number
      t.references :team, null: false, foreign_key: true
      t.references :position, null: false, foreign_key: true
      t.integer :weekly_position_rank
      t.integer :weekly_flex_rank

      t.timestamps
    end
  end
end
