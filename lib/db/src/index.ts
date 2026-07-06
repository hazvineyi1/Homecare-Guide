import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

/**
 * Idempotently create all tables and indexes. Runs on server startup so the
 * schema is self-bootstrapping (no manual SQL, no drizzle-kit at runtime).
 * Every statement is IF NOT EXISTS, so it is safe on an existing database.
 */
export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id serial PRIMARY KEY,
      owner_id text NOT NULL,
      title text NOT NULL,
      completed boolean NOT NULL DEFAULT false,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id serial PRIMARY KEY,
      conversation_id integer NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role text NOT NULL,
      content text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      name text NOT NULL,
      password_hash text NOT NULL,
      email_verified boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id serial PRIMARY KEY,
      owner_id text NOT NULL,
      user_id text,
      topic_id integer NOT NULL,
      score integer NOT NULL,
      total integer NOT NULL,
      passed boolean NOT NULL,
      duration_seconds integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS certificates (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      code text NOT NULL UNIQUE,
      learner_name text NOT NULL,
      mastered_count integer NOT NULL,
      issued_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS conversations_owner_id_idx ON conversations (owner_id);
    CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages (conversation_id);
    CREATE INDEX IF NOT EXISTS attempts_owner_id_idx ON attempts (owner_id);
    CREATE INDEX IF NOT EXISTS attempts_user_id_idx ON attempts (user_id);
    ALTER TABLE certificates ADD COLUMN IF NOT EXISTS level integer;
    ALTER TABLE certificates ADD COLUMN IF NOT EXISTS credential text;
    CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates (user_id);
    CREATE TABLE IF NOT EXISTS organizations (
      id text PRIMARY KEY,
      name text NOT NULL,
      join_code text NOT NULL UNIQUE,
      created_by text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS org_members (
      id text PRIMARY KEY,
      org_id text NOT NULL,
      user_id text NOT NULL,
      role text NOT NULL,
      joined_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS org_members_org_user_idx ON org_members (org_id, user_id);
    CREATE INDEX IF NOT EXISTS org_members_user_idx ON org_members (user_id);
    CREATE TABLE IF NOT EXISTS entitlements (
      owner_id text PRIMARY KEY,
      full_access boolean NOT NULL DEFAULT false,
      source text,
      coupon_code text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS coupons (
      code text PRIMARY KEY,
      percent_off integer,
      note text,
      active boolean NOT NULL DEFAULT true,
      max_redemptions integer,
      redemptions integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS unlock_events (
      id serial PRIMARY KEY,
      owner_id text NOT NULL,
      method text NOT NULL,
      code text,
      note text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key text PRIMARY KEY,
      value text NOT NULL
    );
    CREATE INDEX IF NOT EXISTS unlock_events_owner_idx ON unlock_events (owner_id);
    CREATE TABLE IF NOT EXISTS leads (
      id serial PRIMARY KEY,
      owner_id text,
      kind text NOT NULL DEFAULT 'contact',
      name text,
      email text,
      org text,
      message text NOT NULL,
      handled boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at);
    CREATE TABLE IF NOT EXISTS payments (
      id serial PRIMARY KEY,
      ref text NOT NULL UNIQUE,
      owner_id text NOT NULL,
      trans_token text,
      amount text,
      currency text,
      status text NOT NULL DEFAULT 'created',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS payments_trans_token_idx ON payments (trans_token);
  `);
}
