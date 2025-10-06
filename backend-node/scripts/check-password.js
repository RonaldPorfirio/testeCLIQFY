const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    if (!user) {
      console.error('admin@example.com not found');
      return;
    }
    console.log('hash', user.passwordHash);
    console.log('length', user.passwordHash.length);
    const match = await bcrypt.compare('admin123', user.passwordHash);
    console.log('matches admin123?', match);
  } finally {
    await prisma.$disconnect();
  }
})();
