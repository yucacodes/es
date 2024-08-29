export const allHttpMethods = ['GET', 'POST', 'PUT', 'DELETE'] as const

export type HttpMethod = (typeof allHttpMethods)[number]