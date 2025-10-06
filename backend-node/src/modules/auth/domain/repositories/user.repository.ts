import type { User } from '@modules/auth/domain/entities/user.entity'

export interface UserRepository {
  findByLogin(login: string): Promise<User | null>
  findById(id: number): Promise<User | null>
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')
