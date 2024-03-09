import { singleton } from '../injection'

@singleton()
export class Environment {
  getString(name: string, defaultValue?: string): string {
    const value = process.env[name] ?? defaultValue
    if (value == null) {
      throw new Error(
        `${name} environment variable is required but not found and defaultValue is not provided`
      )
    }
    return value
  }

  getNumber(name: string, defaultValue?: number): number {
    const stringValue = this.getString(
      name,
      defaultValue === undefined ? undefined : defaultValue.toString()
    )
    const numValue = +stringValue
    if (isNaN(numValue)) {
      throw new Error(`${name} environment variable is not a number`)
    }
    return numValue
  }
}
