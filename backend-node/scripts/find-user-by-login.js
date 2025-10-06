const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const normalized = 'admin@example.com'.toLowerCase();
    const record = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: normalized, mode: 'insensitive' } },
          { email: { equals: normalized, mode: 'insensitive' } },
        ],
      },
    });
    console.log(record);
  } finally {
    await prisma.$disconnect();
  }
})();
