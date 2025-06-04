class Position < ApplicationRecord
  has_many :players

  validates :position_name, presence: true, uniqueness: true
end
