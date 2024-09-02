import { Constructor } from "../generics"

export type InjectionConfig =
  | Constructor<Object>
  | false
  | Constructor<Object>[]



