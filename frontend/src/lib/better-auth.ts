import { betterAuth, getAuthTables } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// Connect to SQLite database in project directory
const dbPath = path.join(process.cwd(), 'luna-auth.sqlite');
const db = new DatabaseSync(dbPath);

// Ensure tables exist on boot
function ensureSchema() {
  const testTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").all();
  if (testTables.length === 0) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" INTEGER NOT NULL DEFAULT 0,
        "image" TEXT,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL,
        "role" TEXT DEFAULT 'customer',
        "phone" TEXT,
        "privileges" TEXT,
        "designation" TEXT,
        "avatarColor" TEXT,
        "tenantId" TEXT,
        "memberTier" TEXT,
        "visitsCount" REAL
      );
      CREATE TABLE IF NOT EXISTS "session" (
        id TEXT PRIMARY KEY,
        "expiresAt" INTEGER NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL,
        "activeOrganizationId" TEXT
      );
      CREATE TABLE IF NOT EXISTS "account" (
        id TEXT PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" INTEGER,
        "refreshTokenExpiresAt" INTEGER,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "verification" (
        id TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" INTEGER NOT NULL,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "organization" (
        id TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "logo" TEXT,
        "createdAt" INTEGER NOT NULL,
        "metadata" TEXT
      );
      CREATE TABLE IF NOT EXISTS "member" (
        id TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'member',
        "createdAt" INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "invitation" (
        id TEXT PRIMARY KEY,
        "organizationId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "expiresAt" INTEGER NOT NULL,
        "createdAt" INTEGER NOT NULL,
        "inviterId" TEXT NOT NULL
      );
    `);
  }
}

ensureSchema();

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'luna_secret_auth_key_2026_super_secure_multi_tenant',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'customer',
      },
      phone: {
        type: 'string',
        required: false,
      },
      privileges: {
        type: 'string', // JSON string array of StaffPrivilege
        required: false,
      },
      designation: {
        type: 'string',
        required: false,
      },
      avatarColor: {
        type: 'string',
        required: false,
      },
      tenantId: {
        type: 'string',
        required: false,
      },
      memberTier: {
        type: 'string',
        required: false,
      },
      visitsCount: {
        type: 'number',
        required: false,
      },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});
