import { Injectable } from '@nestjs/common'
import { User, type UserRole } from '@modules/auth/domain/entities/user.entity'
import type { UserRepository } from '@modules/auth/domain/repositories/user.repository'

interface StoredUserProps {
  id: number
  username: string
  email: string
  name: string
  role: UserRole
  passwordHash: string
}

const ADMIN_PASSWORD_HASH = '.oTSXDODrOA4yYhVNJ.1Sl9Xdu4RK2O/lQHN9L0Izz511CQ44C'
const AGENT_PASSWORD_HASH = '/RjThLcbh3O27G5nZNqFOpCroghmISC11mpgkPLGQRpFpIWvzjHO'
const VIEWER_PASSWORD_HASH = '.DLkyhBpk/C0hAtak8d8Fa5XS/3r3J0i'

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[]

  constructor() {
    const seedUsers: StoredUserProps[] = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        passwordHash: 'admin123',
      },
      {
        id: 2,
        username: 'agent',
        email: 'agent@example.com',
        name: 'Field Agent',
        role: 'agent',
        passwordHash: 'agent123',
      },
      {
        id: 3,
        username: 'viewer',
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: 'viewer',
        passwordHash: 'viewer123',
      },
    ]

    this.users = seedUsers.map((props) => new User(props))
  }

  async findByLogin(login: string): Promise<User | null> {
    const normalized = login.toLowerCase()
    return (
      this.users.find(
        (user) => user.username.toLowerCase() === normalized || user.email.toLowerCase() === normalized,
      ) ?? null
    )
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null
  }
}

