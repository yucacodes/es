export const allHttpMethods = ['get', 'post', 'put', 'delete', 'all'] as const

export type HttpMethod = (typeof allHttpMethods)[number]