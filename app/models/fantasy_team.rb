class FantasyTeam < ApplicationRecord
  belongs_to :user
  has_many :players

  validates :name, presence: true
end