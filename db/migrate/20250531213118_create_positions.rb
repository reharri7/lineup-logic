class CreatePositions < ActiveRecord::Migration[8.0]
  def change
    create_table :positions do |t|
      t.string :position_name

      t.timestamps
    end
  end
end
