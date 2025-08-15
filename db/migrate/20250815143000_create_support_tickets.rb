class CreateSupportTickets < ActiveRecord::Migration[8.0]
  def change
    create_table :support_tickets do |t|
      t.string :reply_to, null: false
      t.text :message, null: false
      t.boolean :resolved, null: false, default: false
      t.datetime :resolved_at

      t.timestamps
    end

    add_index :support_tickets, :resolved
    add_index :support_tickets, :reply_to
  end
end
