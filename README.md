# DocVault — Document Management System

Document Management application.

```
docvault/
├── backend/    Node.js + Express + TypeScript + PostgreSQL (Sequelize) API
├── frontend/   Vite + React + TypeScript client
└── docvault.postman_collection.json
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
docker-compose up --build      # starts app + postgres + redis
docker-compose exec app npx sequelize-cli db:migrate
docker-compose exec app npx sequelize-cli db:seed:all
```

Or run locally without Docker — see `backend/README.md`.

API: `http://localhost:5000` · Swagger: `http://localhost:5000/api-docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

### 3. Login

| Email                  | Role     | Password     |
|------------------------|----------|--------------|
| admin@docvault.io      | ADMIN    | Password123  |
| manager@docvault.io    | MANAGER  | Password123  |
| employee@docvault.io   | EMPLOYEE | Password123  |

## Documentation

- **Backend**: architecture, API reference, RBAC matrix, tradeoffs → `backend/README.md`
- **Frontend**: UI overview, design tokens → `frontend/README.md`
- **Database schema**: `backend/schema.sql`
- **Postman collection**: `docvault.postman_collection.json`

## What's implemented

- ✅ JWT auth (register/login/refresh) with bcrypt hashing
- ✅ RBAC middleware (`authenticate`, `authorize`) — ADMIN / MANAGER / EMPLOYEE
- ✅ Document upload (PDF-only, size-limited, local disk or optional S3)
- ✅ Document list — pagination, search by title, sort, filter by uploader
- ✅ Document delete with ownership/role checks
- ✅ Admin user management (list, role update, delete)
- ✅ Clean architecture: controllers → services → repositories
- ✅ express-validator on all inputs
- ✅ Centralized error handling with custom error classes
- ✅ Winston + Morgan logging
- ✅ Swagger/OpenAPI docs
- ✅ Optional Redis caching on document list (graceful degrade if unavailable)
- ✅ Dockerfile + docker-compose (app/postgres/redis)
- ✅ Unit tests (JWT, error classes, RBAC middleware) + integration tests (auth & documents, 25 cases)
- ✅ React frontend with role-aware UI, upload modal, ledger-style document table, admin staff directory
