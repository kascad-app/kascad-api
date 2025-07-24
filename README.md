# Kascad API

A modern REST API built with NestJS to connect sponsors and riders in the sports ecosystem.

## 🚀 Technologies

- **Framework**: NestJS (TypeScript)
- **HTTP Adapter**: Fastify
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Storage**: Google Cloud Storage
- **Validation**: Zod schemas
- **Testing**: Jest
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js (recommended version: 18+)
- pnpm
- MongoDB
- Google Cloud account (for file storage)

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd kascad-api

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configurations
```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/kascad

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Application
PORT=3000
NODE_ENV=development
```

## 🏃‍♂️ Getting Started

```bash
# Development with hot reload
pnpm run start:dev

# Debug mode
pnpm run start:debug

# Production
pnpm run build
pnpm run start:prod
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# Watch mode tests
pnpm run test:watch

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e

# Debug tests
pnpm run test:debug
```

## 🎯 Code Quality

```bash
# Linting with auto-fix
pnpm run lint

# Format code
pnpm run format

# Check formatting
pnpm run format:check
```

## 🏗️ Architecture

### Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/                 # Configuration services
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── exceptions/         # Custom exceptions
│   ├── guards/             # Authentication guards
│   └── pipes/              # Validation pipes
├── shared/                 # Shared services
│   └── gcp/               # Google Cloud services
└── features/              # Business modules
    ├── auth/              # Authentication
    ├── riders/            # Rider management
    ├── sponsors/          # Sponsor management
    ├── offers/            # Offer management
    ├── contracts/         # Contract management
    ├── search/            # Advanced search
    └── articles/          # Article management
```

### Core Modules

#### 🔐 Auth Module
- JWT authentication with access/refresh tokens
- Separate strategies for riders and sponsors
- Global authentication and permission guards
- Secure token storage via cookies

#### 👤 Riders Module
- Complete rider profile management
- Avatar upload via Google Cloud Storage
- Scheduled tasks via `RidersCronService`
- MongoDB indexes for search optimization

#### 🏢 Sponsors Module
- Sponsor profile management
- Similar functionality to riders module

#### 🎯 Offers Module
- Complete CRUD operations for offers
- Dashboard with pagination for sponsors
- Status system (draft, active, paused, expired, closed, deleted)
- Budget management with multiple currencies
- Applications and custom riders

#### 🔍 Search Module
- Advanced search with MongoDB aggregation pipelines
- Complex filters (sports, location, age, availability)
- Saved searches functionality
- Result pagination and sorting

#### 📄 Contracts Module
- Contract management between riders and sponsors
- Validation and signature workflows

## 📡 API Endpoints

### Authentication
```
POST /auth/riders/login       # Rider login
POST /auth/sponsors/login     # Sponsor login
POST /auth/refresh           # Refresh tokens
POST /auth/logout            # Logout
```

### Riders
```
GET    /riders               # List riders
POST   /riders               # Create rider
GET    /riders/:id           # Get rider details
PUT    /riders/:id           # Update rider
DELETE /riders/:id           # Delete rider
POST   /riders/:id/avatar    # Upload avatar
```

### Sponsors
```
GET    /sponsors             # List sponsors
POST   /sponsors             # Create sponsor
GET    /sponsors/:id         # Get sponsor details
PUT    /sponsors/:id         # Update sponsor
DELETE /sponsors/:id         # Delete sponsor
```

### Offers
```
GET    /offers               # List offers (with pagination)
POST   /offers               # Create offer
GET    /offers/dashboard     # Sponsor dashboard (with pagination)
GET    /offers/stats         # Offer statistics
GET    /offers/:id           # Get offer details
PUT    /offers/:id           # Update offer
DELETE /offers/:id           # Delete offer
```

### Search
```
POST   /search               # Advanced search
GET    /search/saved         # Saved searches
POST   /search/save          # Save search
```

## 🔒 Security

- **JWT Authentication**: Secure tokens with expiration
- **CORS**: Cross-origin request configuration
- **Validation**: Zod schemas for all inputs
- **Hashing**: bcrypt for passwords
- **Rate Limiting**: Protection against abuse
- **Secure Cookies**: HttpOnly, Secure, SameSite

## 📊 Database

### MongoDB with Mongoose
- **Multiple connections** for different modules
- **Optimized indexes** for performance
- **Aggregation pipelines** for complex queries
- **Typed schemas** with validation

### Main Collections
- `users` - User data (riders/sponsors)
- `offers` - Sports offers
- `contracts` - Contracts
- `applications` - Applications
- `custom-riders` - Custom riders
- `articles` - Articles/news

## 🚀 Deployment

### Supported Environments
- **Development**: Hot reload, debug enabled
- **Test**: Test database, mocks
- **Production**: Optimizations, full logging

### Environment-specific Variables
```bash
# Development
.env.development

# Test
.env.test

# Production
.env.production
```

## 📈 Monitoring

- **Structured logging** with appropriate levels
- **Centralized error handling**
- **Performance metrics** via middlewares
- **Health checks** for monitoring

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow NestJS conventions
- Use strict TypeScript
- Write tests for new features
- Follow ESLint and Prettier rules
- Document new APIs

## 📄 License

This project is licensed under the [MIT](LICENSE) License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review [GitHub Issues](link-to-issues)
3. Create a new issue if needed

---

**Built with ❤️ for the sports ecosystem**