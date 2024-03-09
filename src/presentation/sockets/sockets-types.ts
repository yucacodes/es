import type { UseCase } from '../../application'

export type SocketErrorResult = { success: false; errorCode?: string }

export type SocketSuccessResult<R> = { success: true; data: R }

export type SocketResult<R> = SocketSuccessResult<R> | SocketErrorResult

export type SocketCallback<R> = (result: SocketResult<R>) => void

// export type SocketListener<Request, Result> = (
//   request: Request,
//   callback: SocketCallback<Result>
// ) => void

export type SocketListener<UC> =
  UC extends UseCase<infer Req, infer Res>
    ? (request: Req, callback: SocketCallback<Res>) => void
    : never

export type SocketEmit<Data> = (data: Data) => void
