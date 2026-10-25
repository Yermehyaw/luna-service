const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { betterAuth } = require('better-auth');
const { organization } = require('better-auth/plugins');

const dbPath = path.join(__dirname, '..', 'luna-auth.sqlite');
const db = new DatabaseSync(dbPath);

const auth = betterAuth({
  database: db,
  baseURL: 'http://localhost:3000',
  secret: 'luna_secret_auth_key_2026_super_secure_multi_tenant',
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'customer' },
      phone: { type: 'string', required: false },
      privileges: { type: 'string', required: false },
      designation: { type: 'string', required: false },
      avatarColor: { type: 'string', required: false },
      tenantId: { type: 'string', required: false },
      memberTier: { type: 'string', required: false },
      visitsCount: { type: 'number', required: false },
    },
  },
  plugins: [organization()],
});

async function seed() {
  console.log('Seeding initial accounts into Better-Auth SQLite database...');

  const usersToSeed = [
    // 1. Business Owners
    {
      email: 'kemi@kemislounge.com',
      password: 'password123',
      name: 'Kemi Adeleke',
      role: 'tenant_admin',
      phone: '+234 802 345 6789',
      tenantId: 'kemis-lounge',
      designation: 'Business Owner & Creative Lead',
      avatarColor: '#831843',
      privileges: JSON.stringify([
        'ops_console',
        'customer_directory',
        'approve_documents',
        'manage_services',
        'manage_branches',
        'view_analytics',
        'social_studio',
      ]),
    },
    {
      email: 'marcus@quickfixauto.com',
      password: 'password123',
      name: 'Marcus Sterling',
      role: 'tenant_admin',
      phone: '+234 803 123 4567',
      tenantId: 'quickfix-auto',
      designation: 'Managing Partner & Master Tech',
      avatarColor: '#1E293B',
      privileges: JSON.stringify([
        'ops_console',
        'customer_directory',
        'approve_documents',
        'manage_services',
        'manage_branches',
        'view_analytics',
        'social_studio',
      ]),
    },

    // 2. Staff Accounts
    {
      email: 'blessing@kemislounge.com',
      password: 'password123',
      name: 'Blessing Eze',
      role: 'staff',
      phone: '+234 805 111 2233',
      tenantId: 'kemis-lounge',
      designation: 'Lead Stylist & Braider',
      avatarColor: '#D97706',
      privileges: JSON.stringify([
        'ops_console',
        'customer_directory',
        'approve_documents',
      ]),
    },
    {
      email: 'tunde@kemislounge.com',
      password: 'password123',
      name: 'Tunde Okafor',
      role: 'staff',
      phone: '+234 809 333 4455',
      tenantId: 'kemis-lounge',
      designation: 'Stylist & Barber',
      avatarColor: '#059669',
      privileges: JSON.stringify(['ops_console']),
    },

    // 3. Platform Super Admin
    {
      email: 'admin@luna.com',
      password: 'password123',
      name: 'Platform Super Admin',
      role: 'super_admin',
      phone: '+234 800 000 0000',
      tenantId: 'platform-master',
      designation: 'Master Operations Director',
      avatarColor: '#291E29',
      privileges: JSON.stringify([
        'ops_console',
        'customer_directory',
        'approve_documents',
        'manage_services',
        'manage_branches',
        'view_analytics',
        'social_studio',
      ]),
    },
  ];

  for (const u of usersToSeed) {
    try {
      const res = await auth.api.signUpEmail({
        body: u,
      });
      console.log(`✅ Seeded: ${u.email} (${u.role})`);
    } catch (err) {
      console.log(`ℹ️ User ${u.email} already registered or skipped:`, err?.message || err);
    }
  }

  console.log('Seeding completed successfully!');
  db.close();
}

seed();
