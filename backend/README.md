# DocVault API

A production-quality **Document Management API** built with Node.js, Express, TypeScript, PostgreSQL (Sequelize), JWT auth, and role-based access control (RBAC).

---

## ✨ Features

- **JWT Authentication** — register/login with access + refresh tokens, bcrypt password hashing
- **Role-Based Access Control** — `ADMIN`, `MANAGER`, `EMPLOYEE` with scoped permissions
- **Document Management** — upload PDFs (local disk or AWS S3), list with pagination/search/sort/filter, delete with permission checks
- **Clean Architecture** — controllers → services → repositories, with middleware/validators/config separated
- **Validation** — `express-validator` on every input
- **Centralized Error Handling** — custom error classes + global error middleware, consistent `{ success, data|message }` response shape
- **Logging** — Winston (file + console) + Morgan (HTTP request logs)
- **Caching** — optional Redis cache on `GET /documents`, invalidated on upload/delete
- **API Docs** — Swagger/OpenAPI at `/api-docs`
- **Dockerized** — `docker-compose` with app + Postgres + Redis
- **Tests** — unit tests (JWT, errors, RBAC middleware) + integration tests (auth & documents flows) with Jest + Supertest

---

## 🏗 Architecture

```
src/
├── config/          # database, logger, swagger, redis config
├── controllers/      # HTTP layer — parse req, call services, format res
├── services/         # business logic (auth, documents, users, S3)
├── repositories/      # data access layer (Sequelize queries)
├── models/           # Sequelize models (User, Document)
├── middleware/        # authenticate, authorize, upload, validate, errorHandler
├── validators/       # express-validator chains
├── routes/           # Express routers + Swagger JSDoc annotations
├── utils/            # errors, JWT helpers, response helpers
├── app.ts            # Express app assembly
└── index.ts          # entrypoint
```

### Why this structure?
- **Controllers** stay thin — only HTTP concerns (parsing, status codes).
- **Services** hold business rules (e.g., RBAC document-scoping logic, S3 vs local storage decision).
- **Repositories** isolate Sequelize/SQL — easy to swap ORM or add caching without touching business logic.
- This separation makes the codebase **testable** (services can be unit-tested with mocked repositories) and **interview-friendly** (clear single-responsibility layers to discuss).

### Why Sequelize over Prisma?
Sequelize was chosen because:
1. Its `sequelize-cli` provides familiar migration/seed tooling expected in many take-home assessments.
2. Model-level hooks (e.g., bcrypt hashing `beforeCreate`) keep password security colocated with the model.
3. Raw SQL `schema.sql` is easy to derive for documentation/ER diagrams.

Prisma would also be a fine choice (arguably nicer DX/type-safety) — Sequelize was picked here for migration-tooling familiarity within a 4-6 hour scope.

---

## 🔐 RBAC Matrix

| Action                  | ADMIN | MANAGER | EMPLOYEE          |
|-------------------------|-------|---------|-------------------|
| Upload document         | ✅    | ✅      | ✅ (own)          |
| List documents          | ✅ all | ✅ all  | ✅ own only       |
| Delete document          | ✅ any | ✅ own only | ✅ own only   |
| Manage users (CRUD/roles)| ✅    | ❌      | ❌                |

> Note: Public registration always creates an `EMPLOYEE`. Role escalation is done via `PATCH /users/:id/role` (ADMIN only).

---

## 🚀 Quick Start (Docker — recommended)

```bash
cd backend
cp .env.example .env
docker-compose up --build
```

This starts:
- `app` on `http://localhost:5000`
- `postgres` on `localhost:5432`
- `redis` on `localhost:6379`

Then run migrations + seed inside the running container:

```bash
docker-compose exec app npx sequelize-cli db:migrate
docker-compose exec app npx sequelize-cli db:seed:all
```

Swagger docs: **http://localhost:5000/api-docs**

---

## 💻 Local Development (without Docker)

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 14+
- Redis (optional — app degrades gracefully without it)

### Setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env` with your local Postgres credentials, then create the database:

```bash
createdb docvault_db
```

### Run Migrations & Seeds

```bash
npm run migrate       # creates users & documents tables
npm run seed          # inserts ADMIN, MANAGER, EMPLOYEE test users
```

To undo:
```bash
npm run seed:undo
npm run migrate:undo
```

### Start the server

```bash
npm run dev      # ts-node-dev, hot reload
# or
npm run build && npm start   # compiled production build
```

Server runs on `http://localhost:5000` (configurable via `PORT`).

---

## 🔑 Seeded Test Accounts

All seeded users share the password: **`Password123`**

| Email                  | Role     |
|------------------------|----------|
| admin@docvault.io      | ADMIN    |
| manager@docvault.io    | MANAGER  |
| employee@docvault.io   | EMPLOYEE |

---

## 📖 API Reference


| Method | Endpoint                  | Auth         | Description |
|--------|---------------------------|--------------|-------------|
| POST   | `/api/v1/auth/register`   | Public       | Register (always EMPLOYEE) |
| POST   | `/api/v1/auth/login`      | Public       | Login → access + refresh tokens |
| POST   | `/api/v1/auth/refresh`    | Public       | Exchange refresh token for new access token |
| GET    | `/api/v1/auth/me`         | Bearer       | Current user claims |
| POST   | `/api/v1/documents/upload`| Bearer       | Upload PDF (multipart: `title`, `file`) |
| GET    | `/api/v1/documents`       | Bearer       | List (pagination/search/sort/filter) |
| GET    | `/api/v1/documents/:id`   | Bearer       | Get single document |
| DELETE | `/api/v1/documents/:id`   | Bearer       | Delete (permission-checked) |
| GET    | `/api/v1/users`           | Bearer (ADMIN)| List users |
| GET    | `/api/v1/users/:id`       | Bearer (ADMIN)| Get user |
| PATCH  | `/api/v1/users/:id/role`  | Bearer (ADMIN)| Change a user's role |
| DELETE | `/api/v1/users/:id`       | Bearer (ADMIN)| Delete a user |

### Response shapes

**Success:**
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

**Error:**
```json
{ "success": false, "message": "Descriptive error message" }
```

---

## 🧪 Example cURL Commands

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@docvault.io","password":"Password123"}'
```

### Upload Document (PDF)
```bash
curl -X POST http://localhost:5000/api/v1/documents/upload \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "title=Q3 Financial Report" \
  -F "file=@/path/to/report.pdf"
```

### List Documents (paginated, search, sort)
```bash
curl "http://localhost:5000/api/v1/documents?page=1&limit=10&search=report&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Delete Document
```bash
curl -X DELETE http://localhost:5000/api/v1/documents/<DOCUMENT_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Admin: Change User Role
```bash
curl -X PATCH http://localhost:5000/api/v1/users/<USER_ID>/role \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role":"MANAGER"}'
```

---

## 🧪 Testing

```bash
npm test                 # all tests
npm run test:unit        # JWT, error classes, RBAC middleware
npm run test:integration # full auth + document flows against test DB
```

Integration tests use the `test` Sequelize config (`docvault_test` database) and `sync({ force: true })` to reset schema — create that database first:

```bash
createdb docvault_test
```

---

## ☁️ AWS S3 (Optional)

To enable S3 storage instead of local disk:

1. `npm install @aws-sdk/client-s3` (not in default deps to keep local-first setups lightweight)
2. Set in `.env`:
   ```
   USE_S3=true
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```
3. Uploaded documents will store the full S3 URL in `fileUrl`, and deletions will remove the S3 object.

---

## 🗄 Redis Caching (Optional)

If `REDIS_HOST` is set and reachable, `GET /documents` responses are cached for 5 minutes per unique query+role combination. Cache is invalidated on any upload or delete. If Redis is unreachable, the app logs a warning and runs without caching — **no hard dependency**.

---

## 🛠 Tradeoffs & Decisions

- **UUIDs over auto-increment IDs** — avoids exposing sequential IDs, safer for public-facing resource references.
- **snake_case DB columns, camelCase in code** — handled automatically via Sequelize's `underscored: true`.
- **EMPLOYEE-only public registration** — prevents privilege escalation; admins must be seeded or promoted by existing admins.
- **Soft S3 dependency** — `@aws-sdk/client-s3` is lazy-required so the app runs without it when `USE_S3=false`.
- **Cache-aside pattern** — simple TTL + pattern-based invalidation rather than a write-through cache, appropriate for read-heavy `GET /documents`.
- **Manager delete scope** — per the spec, MANAGER has upload+list but not blanket delete; managers can only delete their own uploads (interview talking point — could be revisited based on business needs).

---

## 📦 Postman Collection

Import `docvault.postman_collection.json` (in the project root) — includes pre-configured requests for every endpoint with example bodies and a collection-level `{{baseUrl}}` and `{{accessToken}}` variables (auto-set via login request's test script).
