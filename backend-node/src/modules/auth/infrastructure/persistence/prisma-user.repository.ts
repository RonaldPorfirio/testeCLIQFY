import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { User } from '@modules/auth/domain/entities/user.entity';
import type { UserRepository } from '@modules/auth/domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLogin(login: string): Promise<User | null> {
    const normalized = login.toLowerCase();
    const record = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: normalized, mode: 'insensitive' } },
          { email: { equals: normalized, mode: 'insensitive' } },
        ],
      },
    });

    if (!record) {
      return null;
    }

    return this.toEntity(record);
  }

  async findById(id: number): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  private toEntity(record: { id: number; username: string; email: string; name: string; role: Role; passwordHash: string }): User {
    return new User({
      id: record.id,
      username: record.username,
      email: record.email,
      name: record.name,
      role: record.role,
      passwordHash: record.passwordHash,
    });
  }
}
