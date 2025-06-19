# Development Guidelines for Lineup Logic

## Build/Configuration Instructions

### Backend (Rails)

1. **Ruby Version**: This project uses Ruby version specified in `.ruby-version` file.

2. **Dependencies Installation**:
   ```bash
   bundle install
   ```

3. **Database Setup**:
   ```bash
   rails db:create
   rails db:migrate
   ```

4. **Starting the Rails Server**:
   ```bash
   rails server
   ```

### Frontend (Angular)

1. **Node Dependencies Installation**:
   ```bash
   cd client/linup-logic
   npm install
   ```

2. **Starting the Angular Development Server**:
   ```bash
   cd client/linup-logic
   npm start
   ```
   This will run `ng serve` which starts a development server at http://localhost:4200/

3. **API Client Generation**:
   The frontend uses OpenAPI Generator to create TypeScript clients for the backend API:
   ```bash
   cd client/linup-logic
   npm run generate
   ```
   This command will generate TypeScript services based on the Swagger documentation from the Rails backend.

4. **CSS Framework**:
   The project uses Tailwind CSS v4 with daisyUI v5 for styling. Configuration is in `.postcssrc.json`.

## Testing Information

### Backend Testing (Rails)

1. **Running RSpec Tests**:
   ```bash
   bundle exec rspec
   ```

2. **Adding New Tests**:
   - Place model tests in `spec/models/`
   - Place controller tests in `spec/controllers/`
   - Place request tests in `spec/requests/`
   - Place API documentation tests in `spec/requests/api/`

3. **API Documentation Testing**:
   The project uses Rswag for API documentation and testing:
   ```bash
   bundle exec rails rswag:specs:swaggerize
   ```
   This generates Swagger documentation from the RSpec tests.

### Frontend Testing (Angular)

1. **Running Karma Tests**:
   ```bash
   cd client/linup-logic
   npm test
   ```
   This runs the Angular tests using Karma with Jasmine.

2. **Adding New Tests**:
   - Component tests should be placed alongside the component files with `.spec.ts` extension
   - Service tests should be placed alongside the service files with `.spec.ts` extension

3. **Example Test**:
   Here's a simple example of an Angular component test:

   ```typescript
   // src/app/components/example/example.component.spec.ts
   import { ComponentFixture, TestBed } from '@angular/core/testing';
   import { ExampleComponent } from './example.component';

   describe('ExampleComponent', () => {
     let component: ExampleComponent;
     let fixture: ComponentFixture<ExampleComponent>;

     beforeEach(async () => {
       await TestBed.configureTestingModule({
         declarations: [ExampleComponent]
       }).compileComponents();

       fixture = TestBed.createComponent(ExampleComponent);
       component = fixture.componentInstance;
       fixture.detectChanges();
     });

     it('should create', () => {
       expect(component).toBeTruthy();
     });
   });
   ```

## Additional Development Information

### Code Style

1. **Ruby/Rails**:
   - The project follows the Rails Omakase style guide enforced by RuboCop
   - Run `bundle exec rubocop` to check for style violations
   - Run `bundle exec rubocop -a` to automatically fix some violations

2. **Angular/TypeScript**:
   - Follow the Angular style guide: https://angular.io/guide/styleguide
   - Use TypeScript's strict mode for type safety

### Deployment

1. **Docker**:
   The project includes a Dockerfile for containerization.

2. **Kamal**:
   Deployment is configured using Kamal (https://kamal-deploy.org/):
   ```bash
   bundle exec kamal setup
   bundle exec kamal deploy
   ```

### API Documentation

The API documentation is available at `/api-docs` when the Rails server is running. This is generated using Rswag from the RSpec tests.