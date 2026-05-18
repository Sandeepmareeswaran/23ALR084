# Notification System Design

## 1. Architecture
- Frontend: React manager dashboard (`notification_app_fe`) for send, unread, recent, analytics.
- Backend: Express API (`notification_app_be`) exposing notification endpoints.
- Database: PostgreSQL with `users` and `notifications` tables.
- Cache: Redis for unread/recent query acceleration (in-memory fallback in development).
- Logging: Central `Log` function in `logging_middleware/log.js`, sending logs to evaluation server.

## 2. Data Model

### users
- id (PK, varchar)
- email (unique)
- name
- created_at

### notifications
- id (PK, uuid)
- user_id (FK -> users.id)
- type (`Email` | `SMS` | `Push`)
- title
- message
- is_read
- created_at

## 3. API Contracts

### POST /api/notifications/send
- Input: single notification or `{ notifications: [...] }`
- Required: `userId`, `type`, `title`, `message`
- Behavior: inserts rows, invalidates unread/recent caches.

### GET /api/notifications/unread?userId=u1001
- Returns unread notifications for user.
- Uses cache key `unread:<userId>`.

### PATCH /api/notifications/:id/read
- Marks one notification as read.
- Invalidates unread and recent caches.

### GET /api/notifications/recent?limit=10
- Returns latest notifications for manager dashboard.
- Uses cache key `recent:<limit>`.

### GET /api/notifications/analytics?type=Email
- Returns grouped metrics: `total`, `unread`, `latest`.
- Optional `type` filter.

### POST /api/logs/client
- Frontend proxy endpoint to log UI events without exposing token in browser.

## 4. Caching Strategy
- Redis primary cache for production.
- In-memory TTL fallback for local run without Redis.
- TTL:
  - unread: 60s
  - recent: 30s
- Invalidate after create/mark-read operations.

## 5. Query Optimization
- Composite index: `(user_id, is_read, created_at DESC)` for unread timeline.
- Composite index: `(type, created_at DESC)` for analytics and filtered scans.
- Slow query logging warning when recent query latency > 300ms.

## 6. Scale & Reliability
- Batch send supported (`notifications[]`) for higher throughput.
- Stateless API design allows horizontal scaling.
- Redis offloads repeated dashboard reads.
- Logging failures are non-blocking so business APIs stay available.

## 7. Security and Ops
- Secrets are loaded from `.env` (not committed).
- CORS and JSON parsing enabled.
- Central error handler logs failures and returns structured JSON errors.
