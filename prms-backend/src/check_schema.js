const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });
const p = new PrismaClient({ adapter });
(async () => {
  const cats = await p.propertyCategory.count();
  console.log('Categories:', cats);
  const prop = await p.property.count();
  console.log('Properties:', prop);
  const users = await p.user.count();
  console.log('Users:', users);
  process.exit(0);
})();
