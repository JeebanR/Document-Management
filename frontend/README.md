# DocVault Frontend

A Vite + React + TypeScript client for the DocVault Document Management API.

## Features

- Login / Register (JWT stored in `localStorage`)
- Document Registry: paginated, searchable, sortable table of documents
- Upload modal with drag-and-drop, PDF-only client-side validation
- Role-aware UI:
  - `EMPLOYEE` sees only their own documents
  - `ADMIN` / `MANAGER` see all documents and the uploader's name
  - Delete button shown only when the current user has permission
- `ADMIN`-only **Staff Directory** page — change user roles, remove users

## Setup

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` and `/uploads` requests to the backend at `http://localhost:5000` (see `vite.config.ts`).

Make sure the backend is running first.

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Demo accounts

| Email                  | Role     | Password     |
|------------------------|----------|--------------|
| admin@docvault.io      | ADMIN    | Password123  |
| manager@docvault.io    | MANAGER  | Password123  |
| employee@docvault.io   | EMPLOYEE | Password123  |

## Design tokens

Defined in `src/index.css`:
- `--paper` / `--paper-raised` — background surfaces
- `--ink` / `--ink-soft` — text
- `--stamp` — primary accent (rubber-stamp red), used for primary actions
- `--manila` — tan accent for highlights/badges
- Fonts: Source Serif 4 (headings), Inter (body/UI), JetBrains Mono (file metadata, IDs, dates)
