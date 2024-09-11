import bodyParser from 'body-parser'
import express from 'express'
import fmw from 'find-my-way'
import httpMocks from 'node-mocks-http'
import assert from 'node:assert'
import test, { describe } from 'node:test'
import { useCase } from '../../application'
import { container } from '../../injection'
import { ExpressRouter } from '../http-express/ExpressRouterAdapter'
import { FindMyWayRouter } from '../http-find-my-way/FindMyWayRouterAdapter'
import { httpController } from './http-controller'
import { HttpControllerWrapper } from './http-controller-wrapper'
import { HttpMethod } from './http-method'
import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'

function routers() {
  return [
    new ExpressRouter(express.Router()),
    new FindMyWayRouter(fmw()),
  ] as const
}

function methods() {
  return ['GET', 'POST', 'PUT', 'DELETE'] as const
}

function selectRandom(items: readonly any[]) {
  return items[Math.floor(Math.random() * items.length)]
}

describe(`${HttpControllerWrapper.name}`, () => {
  routers().forEach((router) => {
    methods().forEach((method: HttpMethod) => {
      test(`class controller handle  ${method} request with ${router.constructor.name}`, async () => {
        let handledMethod = ''
        const path = `/handle/${method}`

        @httpController({ path })
        class MyHttpController {
          async GET(req: HttpRequest, res: HttpResponse) {
            handledMethod = 'GET'
            return res.send(200)
          }
          async POST(req: HttpRequest, res: HttpResponse) {
            handledMethod = 'POST'
            return res.send(200)
          }
          async PUT(req: HttpRequest, res: HttpResponse) {
            handledMethod = 'PUT'
            return res.send(200)
          }
          async DELETE(req: HttpRequest, res: HttpResponse) {
            handledMethod = 'DELETE'
            return res.send(200)
          }
        }

        const controller = new HttpControllerWrapper(
          container,
          MyHttpController,
          router,
          [],
          [],
        )

        const req = httpMocks.createRequest({ method, path })
        const res = httpMocks.createResponse()
        await controller.router.dispatch(req, res)
        assert.equal(handledMethod, method)
      })
    })
  })

  routers().forEach((router) => {
    methods().forEach((method: HttpMethod) => {
      test(`useCase controller handle  ${method} request with ${router.constructor.name}`, async () => {
        let handledRequest = false
        const path = `/handle/${method}`

        @useCase({
          disableAuthValidation: true,
          disableRequestValidation: true,
        })
        class MyUseCase {
          async perform() {
            handledRequest = true
          }
        }

        const controller = new HttpControllerWrapper(
          container,
          {
            method,
            path,
            useCase: MyUseCase,
            responseFormat: 'json',
          },
          router,
          [],
          [],
        )

        const req = httpMocks.createRequest({ method, path })
        const res = httpMocks.createResponse()
        await controller.router.dispatch(req, res)
        assert(handledRequest)
      })
    })
  })

  routers().forEach((router) => {
    test(`class controller handle ALL methods with ${router.constructor.name}`, async () => {
      const path = `/some/path`
      const methodsCalls: string[] = []

      @httpController({ path })
      class MyHttpController {
        async ALL(req: HttpRequest, res: HttpResponse) {
          methodsCalls.push(req.method!)
          return res.send(200)
        }
      }

      const controller = new HttpControllerWrapper(
        container,
        MyHttpController,
        router,
        [],
        [],
      )

      await Promise.all(
        methods().map(async (method) => {
          const req = httpMocks.createRequest({ method, path })
          const res = httpMocks.createResponse()
          await controller.router.dispatch(req, res)
        }),
      )

      assert.deepEqual(methodsCalls, methods())
    })
  })

  test(`call middlewares in order`, async () => {
    const method = selectRandom(methods())
    const router = selectRandom(routers())
    const path = `/handle/${method}`
    const middlewaresCalls: number[] = []

    @httpController({ path })
    class MyHttpController {
      async ALL(req: HttpRequest, res: HttpResponse) {
        return res.send(200)
      }
    }

    const controller = new HttpControllerWrapper(
      container,
      MyHttpController,
      router,
      [],
      [
        (req, res, next) => {
          middlewaresCalls.push(1)
          next()
        },
        (req, res, next) => {
          middlewaresCalls.push(2)
          next()
        },
      ],
    )

    const req = httpMocks.createRequest({ method, path })
    const res = httpMocks.createResponse()
    await controller.router.dispatch(req, res)
    assert.deepEqual(middlewaresCalls, [1, 2])
  })

  test(`works with bodyParser middlewares`, async () => {
    const method = selectRandom(methods())
    const router = selectRandom(routers())
    const path = `/handle/${method}`

    @httpController({ path })
    class MyHttpController {
      async ALL(req: HttpRequest, res: HttpResponse) {
        return res.send(200)
      }
    }

    const controller = new HttpControllerWrapper(
      container,
      MyHttpController,
      router,
      [],
      [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        bodyParser.text(),
      ],
    )

    const req = httpMocks.createRequest({ method, path })
    const res = httpMocks.createResponse()
    await controller.router.dispatch(req, res)
  })
})
