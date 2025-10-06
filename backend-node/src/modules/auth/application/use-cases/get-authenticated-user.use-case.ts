import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { AuthenticatedUser } from '@modules/auth/domain/entities/user.entity'
import { USER_REPOSITORY, type UserRepository } from '@modules/auth/domain/repositories/user.repository'

@Injectable()
export class GetAuthenticatedUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(id: number): Promise<AuthenticatedUser> {
    const user = await this.users.findById(id)
    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }
    return user.toAuthenticated()
  }
}

