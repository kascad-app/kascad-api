# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Uses `pnpm` as the package manager
- Install dependencies: `pnpm install`

### Development Server
- Start development server: `pnpm run start:dev` (with file watching)
- Start debug mode: `pnpm run start:debug`
- Production build: `pnpm run build`
- Run production server: `pnpm run start:prod`

### Code Quality
- Lint code: `pnpm run lint` (with auto-fix)
- Format code: `pnpm run format`
- Check formatting: `pnpm run format:check`

### Testing
- Run unit tests: `pnpm run test`
- Run tests in watch mode: `pnpm run test:watch`
- Run with coverage: `pnpm run test:cov`
- Run E2E tests: `pnpm run test:e2e`
- Debug tests: `pnpm run test:debug`

## Application Architecture

### Framework & Platform
- Built with **NestJS** framework using **TypeScript**
- Uses **Fastify** as HTTP adapter (not Express)
- **MongoDB** with **Mongoose** ODM for database operations
- **JWT** authentication with refresh tokens
- **Google Cloud Storage** for file uploads

### Core Structure
- `src/main.ts` - Application bootstrap with Fastify configuration
- `src/app.module.ts` - Root module with global configuration
- `src/features/` - Feature-based architecture with dedicated modules
- `src/config/` - Configuration services (database, environment)
- `src/shared/` - Shared services (GCP, storage)
- `src/common/` - Common utilities (decorators, exceptions, constants)

### Feature Modules
The application follows a feature-based modular architecture:

1. **Auth Module** (`src/features/auth/`)
   - JWT authentication strategy with access/refresh tokens
   - Separate auth controllers for riders and sponsors
   - Global authentication and permission guards
   - Uses separate MongoDB connection for auth data

2. **Riders Module** (`src/features/riders/`)
   - Rider profile management and CRUD operations
   - Scheduled tasks via `RidersCronService`
   - MongoDB indexes for search optimization
   - Integration with GCP for file storage

3. **Sponsors Module** (`src/features/sponsors/`)
   - Sponsor profile management
   - Similar structure to riders module

4. **Search Module** (`src/features/search/`)
   - Advanced search functionality with complex MongoDB aggregation pipelines
   - Saved searches capability
   - Comprehensive filtering (sports, location, age, availability, etc.)
   - Search result pagination and sorting
   - Uses Zod for request validation

5. **Contracts Module** (`src/features/contracts/`)
   - Contract management between riders and sponsors

6. **Articles Module** (`src/features/articles/`)
   - Content management system

### Database Architecture
- **MongoDB** with multiple connection configurations
- Uses **Mongoose schemas** with proper indexing
- **Aggregation pipelines** for complex search queries
- Connection management via `MongoDBConfigService`
- Separate database connections for different features (auth, riders, etc.)

### Authentication & Security
- **JWT-based authentication** with separate access and refresh tokens
- **Global guards** for authentication and permission checking
- **Cookie-based** token storage with security configurations
- **CORS** configuration for cross-origin requests
- **bcrypt** for password hashing

### Request Validation
- **Zod schemas** for comprehensive request validation
- Type-safe DTOs with proper error handling
- Advanced validation for search filters and pagination

### Key Configuration
- Environment-based configuration via `@nestjs/config`
- MongoDB connection string building for different environments
- JWT token configuration with separate secrets for access/refresh
- File upload limits and multipart handling
- CORS and cookie security settings

## Important Notes

### MongoDB Search Functionality
The search system uses sophisticated MongoDB aggregation pipelines:
- Located in `src/features/search/aggregates/get-search-pipeline.ts`
- Supports complex filtering including age calculation, text search, and multiple criteria
- Uses indexes for performance optimization
- Implements pagination and sorting

### Testing Strategy
- Unit tests use Jest with ts-jest transformer
- Tests are located alongside source files with `.spec.ts` extension
- E2E tests have separate Jest configuration
- Coverage reporting available

### Code Style
- Uses ESLint with TypeScript support
- Prettier for code formatting
- Simple import sort plugin for organized imports
- Follows NestJS conventions and patterns

### Environment Configuration
- Supports multiple environment files (.env.development, .env.production, etc.)
- Environment-specific MongoDB connection configuration
- JWT secrets and token expiration settings
- CORS and security configurations

## Development Workflow

1. **Setup**: Run `pnpm install` to install dependencies
2. **Development**: Use `pnpm run start:dev` for development with hot reload
3. **Testing**: Run `pnpm run test` for unit tests, `pnpm run test:e2e` for E2E tests
4. **Code Quality**: Use `pnpm run lint` and `pnpm run format` before committing
5. **Building**: Use `pnpm run build` to create production build