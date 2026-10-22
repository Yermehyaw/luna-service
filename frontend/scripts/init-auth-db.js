const { DatabaseSync } = require('node:sqlite');
const { betterAuth, getAuthTables } = require('better-auth');
const { organization } = require('better-auth/plugins');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'luna-auth.sqlite');
const db = new DatabaseSync(dbPath);

const auth = betterAuth({
  database: db,
  baseURL: 'http://localhost:3000',
  secret: 'luna_secret_auth_key_2026_super_secure',
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

const tables = getAuthTables(auth.options);
for (const [tableName, table] of Object.entries(tables)) {
  const cols = ['id TEXT PRIMARY KEY'];
  for (const [field, def] of Object.entries(table.fields)) {
    if (field === 'id') continue;
    let sqlCol = `"${field}"`;
    if (def.type === 'string') sqlCol += ' TEXT';
    else if (def.type === 'number') sqlCol += ' REAL';
    else if (def.type === 'boolean') sqlCol += ' INTEGER';
    else if (def.type === 'date') sqlCol += ' INTEGER';
    else sqlCol += ' TEXT';

    if (def.required) sqlCol += ' NOT NULL';
    if (def.unique) sqlCol += ' UNIQUE';
    if (def.defaultValue !== undefined && typeof def.defaultValue !== 'function') {
      if (typeof def.defaultValue === 'string') sqlCol += ` DEFAULT '${def.defaultValue}'`;
      else if (typeof def.defaultValue === 'boolean') sqlCol += ` DEFAULT ${def.defaultValue ? 1 : 0}`;
      else sqlCol += ` DEFAULT ${def.defaultValue}`;
    }
    cols.push(sqlCol);
  }
  const createSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${cols.join(',\n  ')}\n);`;
  console.log('SQL:', createSql);
  db.exec(createSql);
}

console.log('SUCCESS: All tables created in luna-auth.sqlite!');
db.close();
