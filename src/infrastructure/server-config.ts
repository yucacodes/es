import { AuthProviderConfig, EmitterConfig, HttpControllerConfig } from "../presentation"
import { InjectionConfig } from "./injection-config"

export interface ServerConfig {
  controllers?: HttpControllerConfig[]
  emitters?: EmitterConfig[]
  authProviders?: AuthProviderConfig[]
  injections?: InjectionConfig[]
}


// export function server(config: serverConfig) {
//   return (constructor: Constructor<Server>) => {
//     constructor.prototype.__config__ = function __config__() {
//       return config
//     }
//   }
// }
