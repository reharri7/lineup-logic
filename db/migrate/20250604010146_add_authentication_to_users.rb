class AddAuthenticationToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :auth_token, :string
    add_column :users, :token_expires_at, :datetime
    add_index :users, :auth_token, unique: true
  end
end
