# Azure Magnetar Backend API

Dating app backend built with **Go (Gin + GORM + MySQL)**.

## Quick Start

```bash
# Set environment variables
export DSN="user:password@tcp(localhost:3306)/azure_magnetar?charset=utf8mb4&parseTime=True&loc=Local"
export JWT_SECRET="your-production-secret"
export RESEND_API_KEY="your-resend-api-key"
export PORT=8080
export API_BASE_URL="https://your-api-domain.com"   # Defaults to http://localhost:$PORT
export FRONTEND_URL="https://your-frontend-domain.com" # Defaults to http://localhost:5173

# Run
go run ./cmd/server/

# Test
go test ./... -v
```

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register |
| POST | `/api/v1/auth/login` | ❌ | Login (returns JWT) |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/me` | ✅ | Get current user profile |
| PUT | `/api/v1/users/me` | ✅ | Update profile |
| GET | `/api/v1/users/:id` | ❌ | Get public profile |
| GET | `/api/v1/users/:id/works` | ❌ | Get user's works |
| GET | `/api/v1/users/:id/activities` | ❌ | Get user's activities |
| POST | `/api/v1/users/:id/follow` | ✅ | Follow user |
| DELETE | `/api/v1/users/:id/follow` | ✅ | Unfollow user |

### Activities
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/activities` | ❌ | List (filter: location, date, tags) |
| GET | `/api/v1/activities/:id` | ❌ | Get detail |
| POST | `/api/v1/activities` | ✅ | Create |
| PUT | `/api/v1/activities/:id` | ✅ | Update (host only) |
| DELETE | `/api/v1/activities/:id` | ✅ | Delete (host only) |
| POST | `/api/v1/activities/:id/apply` | ✅ | Apply to join |
| DELETE | `/api/v1/activities/:id/apply` | ✅ | Cancel application |
| GET | `/api/v1/activities/:id/status` | ✅ | Check user's status |
| GET | `/api/v1/activities/:id/applicants` | ✅ | List applicants (host) |
| PUT | `/api/v1/activities/:id/applicants/:userId/status` | ✅ | Accept/reject (host) |
| GET | `/api/v1/activities/:id/comments` | ❌ | List comments |
| POST | `/api/v1/activities/:id/comments` | ✅ | Post comment |
| GET | `/api/v1/activities/:id/participants` | ❌ | List participants |
| POST | `/api/v1/activities/:id/rate` | ✅ | Rate participant |
| GET | `/api/v1/activities/:id/ratings` | ✅ | View ratings |

### Works
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/works` | Optional | Wall (trending/following) |
| GET | `/api/v1/works/:id` | ❌ | Get detail |
| POST | `/api/v1/works` | ✅ | Upload work |
| PUT | `/api/v1/works/:id` | ✅ | Update (author only) |
| DELETE | `/api/v1/works/:id` | ✅ | Delete (author only) |
| POST | `/api/v1/works/:id/like` | ✅ | Like |
| DELETE | `/api/v1/works/:id/like` | ✅ | Unlike |
| GET | `/api/v1/works/:id/comments` | ❌ | List comments |
| POST | `/api/v1/works/:id/comments` | ✅ | Post comment |

### Comments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/api/v1/comments/:id` | ✅ | Delete (author only) |

### Notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/notifications` | ✅ | List notifications |
| GET | `/api/v1/notifications/unread-count` | ✅ | Unread count |
| POST | `/api/v1/notifications/:id/read` | ✅ | Mark as read |

## Architecture

```
cmd/server/          → Entry point, DI wiring, routes
internal/
  handler/           → HTTP handlers (request/response)
  service/           → Business logic layer
  repository/        → Database access (GORM)
  model/             → GORM models
  middleware/        → JWT auth middleware
pkg/
  auth/              → JWT token utilities
  apperror/          → Domain error types (typed errors with HTTP mapping)
  database/          → DB connection
  response/          → API response helpers
  email/             → Email sending (Brevo API)
  logger/            → Structured logging (JSON, slog-based)
  storage/           → File storage (Base64 image decoding & saving)
  utils/             → Password hashing, secure token generation
config/              → Config loading (env vars)
```

## Swagger

Available at `http://localhost:8080/swagger/index.html` when server is running.

## Testing

```bash
go test ./... -v        # All tests
go test ./pkg/auth/...  # JWT tests only
go test ./internal/service/... # Service layer tests
```
