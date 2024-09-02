export const allHttpMethods = ['GET', 'POST', 'PUT', 'DELETE'] as const
export const allHttpMethodsLowerCase = ['get', 'post', 'put', 'delete'] as const

export type HttpMethod = (typeof allHttpMethods)[number]
export type HttpMethodLowerCase = (typeof allHttpMethodsLowerCase)[number]
