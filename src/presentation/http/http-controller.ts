export type HttpController = {
  get<Q, R>(query: Q): Promise<R>
  post<Q, B, R>(query: Q, body: B): Promise<R>
  put<Q, B, R>(query: Q, body: B): Promise<R>
  delete<Q, R>(query: Q): Promise<R>
}
