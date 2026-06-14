-- ============================================================
-- DocVault — PostgreSQL Schema
-- ============================================================
-- This file represents the schema produced by the Sequelize
-- migrations. Useful for manual setup, review, or ER diagrams.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: users
-- ============================================================
CREATE TYPE enum_users_role AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        enum_users_role NOT NULL DEFAULT 'EMPLOYEE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_idx ON users (email);
CREATE INDEX users_role_idx ON users (role);

-- ============================================================
-- Table: documents
-- ============================================================
CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    file_url    TEXT NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_size   INTEGER NOT NULL CHECK (file_size > 0),
    mime_type   VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX documents_uploaded_by_idx ON documents (uploaded_by);
CREATE INDEX documents_title_idx ON documents (title);
CREATE INDEX documents_created_at_idx ON documents (created_at);

-- ============================================================
-- Seed Data: default users (password for all = "Password123")
-- Password hash below is bcrypt(12) of "Password123"
-- Generate your own with: node -e "console.log(require('bcryptjs').hashSync('Password123',12))"
-- ============================================================
INSERT INTO users (id, name, email, password, role) VALUES
  (uuid_generate_v4(), 'Alice Admin',    'admin@docvault.io',    '$2a$12$replace_with_generated_hash', 'ADMIN'),
  (uuid_generate_v4(), 'Bob Manager',    'manager@docvault.io',  '$2a$12$replace_with_generated_hash', 'MANAGER'),
  (uuid_generate_v4(), 'Eve Employee',   'employee@docvault.io', '$2a$12$replace_with_generated_hash', 'EMPLOYEE');

-- ============================================================
-- Entity Relationship Notes
-- ============================================================
-- users (1) ----< (many) documents
--   - documents.uploaded_by -> users.id
--   - ON DELETE CASCADE: deleting a user removes their documents
-- ============================================================
