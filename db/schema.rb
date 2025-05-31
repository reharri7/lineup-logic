# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_05_31_220123) do
  create_table "fantasy_team_players", force: :cascade do |t|
    t.integer "fantasy_team_id", null: false
    t.integer "player_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["fantasy_team_id"], name: "index_fantasy_team_players_on_fantasy_team_id"
    t.index ["player_id"], name: "index_fantasy_team_players_on_player_id"
  end

  create_table "fantasy_teams", force: :cascade do |t|
    t.string "name"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_fantasy_teams_on_user_id"
  end

  create_table "players", force: :cascade do |t|
    t.string "name"
    t.integer "number"
    t.integer "team_id", null: false
    t.integer "position_id", null: false
    t.integer "fantasy_team_id", null: false
    t.integer "weekly_position_rank"
    t.integer "weekly_flex_rank"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["fantasy_team_id"], name: "index_players_on_fantasy_team_id"
    t.index ["position_id"], name: "index_players_on_position_id"
    t.index ["team_id"], name: "index_players_on_team_id"
  end

  create_table "positions", force: :cascade do |t|
    t.string "position_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "teams", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "email"
    t.string "password_digest"
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "fantasy_team_players", "fantasy_teams"
  add_foreign_key "fantasy_team_players", "players"
  add_foreign_key "fantasy_teams", "users"
  add_foreign_key "players", "fantasy_teams"
  add_foreign_key "players", "positions"
  add_foreign_key "players", "teams"
end
