Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    # Authentication routes
    post "/login", to: "authentication#login"
    delete "/logout", to: "authentication#logout"
    post "/refresh_token", to: "authentication#refresh_token"

    # Registration routes
    post "/signup", to: "users#create"

    # Password reset routes
    resources :password_resets, only: [ :create, :update ], param: :token

    # Admin routes
    resources :teams
    resources :positions
    resources :players

    resources :fantasy_teams do
      resources :players, only: [ :create, :destroy ], controller: "fantasy_team_players"
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
