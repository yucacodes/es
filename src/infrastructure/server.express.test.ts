import assert from 'assert'
import express, { Router } from 'express'
import { ServerResponse } from 'http'
import httpMocks from 'node-mocks-http'
import test, { describe } from 'node:test'
import { httpController } from '../presentation'
import { Server } from './server'

async function sendRequest(
  router: Router,
  request: httpMocks.RequestOptions,
): Promise<ServerResponse> {
  return new Promise<ServerResponse>((resolve) => {
    const response = httpMocks.createResponse()
    router(httpMocks.createRequest(request), response, () => {
      resolve(response)
    })
  })
}

describe(`${Server.name} with express`, () => {
  test('instanciate with express router', () => {
    const router = express.Router()
    const server = new Server({}, router)
  })

  test('register http class controller', async () => {
    let handledRequest = false

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async GET() {
        handledRequest = true
      }
    }

    const router = express.Router()
    new Server({ controllers: [MyHttpController] }, router)

    await sendRequest(router, { method: 'GET', url: '/some/path' })
    assert(handledRequest)
  })
})
