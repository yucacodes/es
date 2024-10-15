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
  return ['GET', 'POST'] as const
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

    after(() => {
      variant.httpServer.close()
      variant.httpServer.closeAllConnections()
    })
  })
})
