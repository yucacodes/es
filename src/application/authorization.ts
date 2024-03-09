export abstract class Authorization<Auth> {
  abstract get(): Auth
  abstract set(auth: Auth): void
  abstract roles(): string[]
}
