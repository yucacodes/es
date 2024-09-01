import express, { Router } from 'express'
import httpMocks from 'node-mocks-http'
import assert from 'node:assert'
import { ServerResponse } from 'node:http'
import test, { describe } from 'node:test'
import { container } from '../../injection'
import { httpController } from './http-controller'
import { HttpControllerWrapper } from './http-controller-wrapper'
import { useCase } from '../../application'

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

describe(`${HttpControllerWrapper.name} With express`, () => {
  test('instanciate with express router', () => {
    const httpRouter = express.Router()

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async GET() {}
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

  test('class controller handle  GET request', async () => {
    const httpRouter = express.Router()
    let getMethodRun = false

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async GET() {
        getMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      MyHttpController,
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, { method: 'GET', url: '/some/path' })
    assert(getMethodRun)
  })

  test('class controller handle POST request', async () => {
    const httpRouter = express.Router()
    let postMethodRun = false

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async POST() {
        postMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      MyHttpController,
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, {
      method: 'POST',
      url: '/some/path',
      body: {},
    })
    assert(postMethodRun)
  })

  test('class controller handle PUT request', async () => {
    const httpRouter = express.Router()
    let putMethodRun = false

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async PUT() {
        putMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      MyHttpController,
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, {
      method: 'PUT',
      url: '/some/path',
      body: {},
    })
    assert(putMethodRun)
  })

  test('class controller handle DELETE request', async () => {
    const httpRouter = express.Router()
    let deleteMethodRun = false

    @httpController({
      path: '/some/path',
    })
    class MyHttpController {
      async DELETE() {
        deleteMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      MyHttpController,
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, {
      method: 'DELETE',
      url: '/some/path',
      body: {},
    })
    assert(deleteMethodRun)
  })

  test('useCase controller handle  GET request', async () => {
    const httpRouter = express.Router()
    let getMethodRun = false

    @useCase({
      disableAuthValidation: true,
      disableRequestValidation: true,
    })
    class MyUseCase {
      async perform() {
        getMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      { method: 'GET', path: '/some/path', useCase: MyUseCase },
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, { method: 'GET', url: '/some/path' })
    assert(getMethodRun)
  })

  test('useCase controller handle  POST request', async () => {
    const httpRouter = express.Router()
    let postMethodRun = false

    @useCase({
      disableAuthValidation: true,
      disableRequestValidation: true,
    })
    class MyUseCase {
      async perform() {
        postMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      { method: 'POST', path: '/some/path', useCase: MyUseCase },
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, {
      method: 'POST',
      url: '/some/path',
    })
    assert(postMethodRun)
  })

  test('useCase controller handle  PUT request', async () => {
    const httpRouter = express.Router()
    let putMethodRun = false

    @useCase({
      disableAuthValidation: true,
      disableRequestValidation: true,
    })
    class MyUseCase {
      async perform() {
        putMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      { method: 'PUT', path: '/some/path', useCase: MyUseCase },
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, { method: 'PUT', url: '/some/path' })
    assert(putMethodRun)
  })

  test('useCase controller handle  DELETE request', async () => {
    const httpRouter = express.Router()
    let deleteMethodRun = false

    @useCase({
      disableAuthValidation: true,
      disableRequestValidation: true,
    })
    class MyUseCase {
      async perform() {
        deleteMethodRun = true
      }
    }

    new HttpControllerWrapper(
      container,
      { method: 'DELETE', path: '/some/path', useCase: MyUseCase },
      httpRouter as any,
      [],
      [],
    )

    await sendRequest(httpRouter as any, {
      method: 'DELETE',
      url: '/some/path',
    })
    assert(deleteMethodRun)
  })
})
