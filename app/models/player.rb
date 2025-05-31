class Player < ApplicationRecord
  belongs_to :team
  belongs_to :position
  belongs_to :fantasy_team, optional: true

  validates :name, presence: true
  validates :number, presence: true, numericality: { only_integer: true }
  validates :weekly_position_rank, numericality: { only_integer: true, allow_nil: true }
  validates :weekly_flex_rank, numericality: { only_integer: true, allow_nil: true }
end