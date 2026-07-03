const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'prms-dev-secret-change-me';

(async () => {
  // Find an admin user
  const adminUser = await prisma.user.findFirst({
    where: { is_active: true },
    include: {
      UserRole: { include: { role: true } },
    },
  });

  if (!adminUser) {
    console.log('No active user found');
    process.exit(1);
    return;
  }

  const defaults = [
    { name: 'Apartment', description: 'Standard apartment unit', isShared: true },
    { name: 'Condo', description: 'Condominium property', isShared: true },
    { name: 'House', description: 'Single-family house', isShared: true },
    { name: 'Townhouse', description: 'Townhouse or row house', isShared: true },
    { name: 'Villa', description: 'Luxury villa or estate', isShared: true },
    { name: 'Studio', description: 'Studio apartment', isShared: true },
    { name: 'Penthouse', description: 'Penthouse unit', isShared: true },
  ];

  let seeded = 0;
  for (const cat of defaults) {
    const existing = await prisma.propertyCategory.findUnique({ where: { name: cat.name } });
    if (!existing) {
      await prisma.propertyCategory.create({
        data: { ...cat, ownerId: adminUser.id },
      });
      seeded++;
    }
  }

  console.log(`Seeded ${seeded} default categories`);

  // Generate a token for testing
  const token = jwt.sign({ userId: adminUser.id }, JWT_SECRET);
  console.log(`Admin token: ${token.slice(0, 50)}...`);
  console.log('Done');
  process.exit(0);
})();
