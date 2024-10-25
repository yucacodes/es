import express from 'express'
import http from 'http'
import assert from 'node:assert'
import test, { after, before, describe } from 'node:test'
import { useCase } from '../application'
import { ExpressRouter } from '../presentation/http-express/ExpressRouterAdapter'
import { Server } from './server'

function expressVariant() {
  const expressRouter = express()
  const httpServer = http.createServer(expressRouter)
  const router = new ExpressRouter(expressRouter)
  return {
    router,
    httpServer,
    name: 'express',
    port: 3000,
  }
}

function variants() {
  return [expressVariant()]
}

function methods() {
  return ['GET', 'POST', 'PUT', 'DELETE'] as const
}

variants().forEach((variant) => {
  describe(`${Server.name} with ${variant.name}`, () => {
    before(() => {
      variant.httpServer.listen(variant.port)
    })

    methods().forEach((method) => {
      test(`${method} to empty useCase should result 200`, async () => {
        const path = '/empty-use-case'

        @useCase()
        class EmptyUseCase {
          async perform() {}
        }

        new Server(
          {
            controllers: [
              {
                path,
                method,
                useCase: EmptyUseCase,
              },
            ],
          },
          variant.router,
        )

        const response = await fetch(
          `http://localhost:${variant.port}${path}`,
          {
            method,
          },
        )
        assert.equal(response.status, 200)
      })
    })

    methods().forEach((method) => {
      test(`${method} to useCase should format in JSON by defaut`, async () => {
        const path = '/use-case-with-default-format'
        const sendData = { foo: 'data' }

        @useCase()
        class MyUseCase {
          async perform() {
            return sendData
          }
        }

        new Server(
          {
            controllers: [
              {
                path,
                method,
                useCase: MyUseCase,
              },
            ],
          },
          variant.router,
        )

        const response = await fetch(
          `http://localhost:${variant.port}${path}`,
          {
            method,
          },
        )
        assert.equal(response.status, 200)
        const responseText = new TextDecoder().decode(
          await new Response(response.body).arrayBuffer(),
        )
        assert.equal(response.headers.get('Content-Type'), 'application/json')
        const receivedData = JSON.parse(responseText)
        assert.deepEqual(receivedData, sendData)
      })
    })

    after(() => {
      variant.httpServer.close()
      variant.httpServer.closeAllConnections()
    })
  })
})
