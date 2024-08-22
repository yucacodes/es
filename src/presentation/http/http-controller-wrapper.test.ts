import fmw from 'find-my-way'
import assert from 'node:assert'
import test, { describe } from 'node:test'
import { container } from '../../injection'
import { httpController } from './http-controller'
import { HttpControllerWrapper } from './http-controller-wrapper'
import httpMocks from 'node-mocks-http'

describe(`${HttpControllerWrapper.name}`, () => {
  test('instanciate with find-my-way router', () => {
    const httpRouter = fmw()

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async get() {}
    }

    assert.doesNotThrow(
      () =>
        new HttpControllerWrapper(
          container,
          MyHttpController,
          httpRouter as any,
          [],
          [],
        ),
    )
  })

  test('handle get request', () => {
    const httpRouter = fmw()

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async get() {}
    }

    assert.doesNotThrow(
      () =>
        new HttpControllerWrapper(
          container,
          MyHttpController,
          httpRouter as any,
          [],
          [],
        ),
    )

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/some/path',
    })

    const response = httpMocks.createResponse()

    httpRouter.lookup(request, response)
  })
})
