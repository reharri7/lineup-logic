#!/usr/bin/env ruby
# This script tests creating a player without adding it to a fantasy team

require_relative 'config/environment'

# Find a team and position to use for the player
team = Team.first
position = Position.first

if team.nil? || position.nil?
  puts "Error: Need at least one team and one position in the database"
  exit 1
end

# Create a player without adding it to a fantasy team
player = Player.new(
  name: "Test Player #{Time.now.to_i}",
  number: rand(1..99),
  team: team,
  position: position
)

if player.save
  puts "Success: Player created successfully without being added to a fantasy team"
  puts "Player ID: #{player.id}"
  puts "Player Name: #{player.name}"
  puts "Player Number: #{player.number}"
  puts "Team: #{player.team.name}"
  puts "Position: #{player.position.position_name}"
  puts "Fantasy Teams: #{player.fantasy_teams.count} (should be 0)"
else
  puts "Error: Failed to create player"
  puts player.errors.full_messages
end
