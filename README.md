# Lineup Logic

Full‑stack application with a Ruby on Rails backend and an Angular frontend.

This README explains how to install dependencies, set up the database, run the servers, generate the API client, and execute tests for both apps. It also includes pointers for code style, API docs, and deployment.

## Monorepo Layout

- Backend (Rails): repository root
- Frontend (Angular): `client/linup-logic`

## Prerequisites

- Ruby: version specified in `.ruby-version` (use a version manager like rbenv, rvm, or asdf)
- Bundler: `gem install bundler`
- Node.js and npm: a recent LTS version (e.g., Node 18+ recommended)
- SQLite (for local development) or your configured DB
- Git, and optionally Docker if using containerized workflows

## Backend (Rails)

### 1) Install dependencies
```bash
bundle install
```

### 2) Database setup
```bash
rails db:create
rails db:migrate
```

### 3) Start the Rails server
```bash
rails server
```
The API will be available at: http://localhost:3000/

### 4) API documentation (Rswag)
When the Rails server is running, Swagger UI is available at:
```
http://localhost:3000/api-docs
```

To regenerate Swagger JSON from specs:
```bash
bundle exec rails rswag:specs:swaggerize
```

### 5) Backend tests
Run all RSpec tests:
```bash
bundle exec rspec
```

### 6) Code style (RuboCop)
```bash
bundle exec rubocop
# or to auto-fix safe offenses
bundle exec rubocop -a
```

## Frontend (Angular)

All frontend code lives in `client/linup-logic`.

### 1) Install Node dependencies
```bash
cd client/linup-logic
npm install
```

### 2) Generate API client (from Rails Swagger)
This uses OpenAPI Generator to create TypeScript services based on the backend API. Ensure the Rails server is running and `/api-docs` is available.
```bash
cd client/linup-logic
npm run generate
```

### 3) Start the Angular development server
```bash
cd client/linup-logic
npm start
```
This runs `ng serve` at: http://localhost:4200/

### 4) Frontend tests (Karma + Jasmine)
```bash
cd client/linup-logic
npm test
```

### 5) CSS framework
Tailwind CSS v4 and daisyUI v5 are used for styling. Configuration is in `.postcssrc.json`.

## Typical Local Development Flow

1. Start Rails API:
   ```bash
   rails server
   ```
2. In another terminal, install deps and generate the API client (only when API changes or on first setup):
   ```bash
   cd client/linup-logic
   npm install
   npm run generate
   ```
3. Start Angular dev server:
   ```bash
   npm start
   ```
4. Visit the app at http://localhost:4200/; the API is at http://localhost:3000/.

## Deployment

- Docker: A `Dockerfile` is provided for containerization.
- Kamal: Deployment is configured with Kamal.
  ```bash
  bundle exec kamal setup
  bundle exec kamal deploy
  ```

## Testing Summary

- Backend (Rails): `bundle exec rspec`
- Frontend (Angular):
  ```bash
  cd client/linup-logic
  npm test
  ```
- API Docs generation from specs:
  ```bash
  bundle exec rails rswag:specs:swaggerize
  ```

## Project Scripts Reference

- Rails
  - `rails db:create`, `rails db:migrate`
  - `rails server`
  - `bundle exec rspec`
  - `bundle exec rubocop`, `bundle exec rubocop -a`
- Angular (run from `client/linup-logic`)
  - `npm install`
  - `npm run generate` (OpenAPI client)
  - `npm start` (dev server)
  - `npm test`

## Troubleshooting

- API client generation fails: ensure Rails is running and `/api-docs` is reachable (http://localhost:3000/api-docs). Then rerun `npm run generate`.
- CORS errors in the browser: ensure Rails is configured to allow requests from `http://localhost:4200` in development. If needed, add/adjust Rack::Cors settings.
- Node version issues: use an LTS Node (18+) and clear `node_modules` if necessary (`rm -rf node_modules && npm install`).
- Database issues: try `rails db:drop db:create db:migrate` to reset your local DB.

## License

This project is provided as-is for development purposes. See repository license if present.
