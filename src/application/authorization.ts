export interface AuthRole {
  scope: string
  role: string
}

export interface AuthInfo {
  userId: string
  roles: AuthRole[]
}

export abstract class Auth {
  userId(): string {
    return this.get().userId
  }

  roles(): AuthRole[] {
    return this.get().roles
  }

  roleFor(scope: string): string {
    const role = this.get().roles.find((x) => x.scope == scope)
    if (!role) {
      throw new Error(`Not found role for scope= '${scope}'`)
    }
    return role.role
  }

  abstract set(authInfo: AuthInfo): void
  abstract get(): AuthInfo
}
