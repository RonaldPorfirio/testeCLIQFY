import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  const hash = user?.passwordHash || '';
  console.log('hash', hash);
  console.log('length', hash.length);
})();
