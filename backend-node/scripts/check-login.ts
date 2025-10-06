import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  const hash = user?.passwordHash ?? ''
  console.log('hash length', hash.length, 'hash', hash)

  if (!hash) {
    console.log('No password hash found for admin@example.com')
    return
  }

  const ok = await bcrypt.compare('admin123', hash)
  console.log('compare result', ok)
}

main()
  .catch((error) => {
    console.error('check-login failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
