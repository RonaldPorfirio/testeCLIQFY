export type UserRole = 'admin' | 'agent' | 'viewer'

export interface AuthenticatedUser {
  id: number
  username: string
  email: string
  name: string
  role: UserRole
}

export class User {
  constructor(
    private readonly props: {
      id: number
      username: string
      email: string
      name: string
      role: UserRole
      passwordHash: string
    },
  ) {}

  get id(): number {
    return this.props.id
  }

  get username(): string {
    return this.props.username
  }

  get email(): string {
    return this.props.email
  }

  get name(): string {
    return this.props.name
  }

  get role(): UserRole {
    return this.props.role
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  toAuthenticated(): AuthenticatedUser {
    const { id, username, email, name, role } = this.props
    return { id, username, email, name, role }
  }
}
