import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`SELECT email, LENGTH("passwordHash") as len FROM "User"`;
  console.log(rows);
}

main().finally(() => prisma.$disconnect());
