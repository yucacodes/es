import express from 'express'
import http from 'http'
import assert from 'node:assert'
import test, { after, before, describe } from 'node:test'
import { useCase } from '../application'
import { ExpressRouter } from '../presentation/http-express/ExpressRouterAdapter'
import { Server } from './server'
import { httpController, HttpRequest, HttpResponse } from '../presentation'

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

        const response = await fetch(`http://localhost:${variant.port}${path}`, {
          method,
        })
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

        const response = await fetch(`http://localhost:${variant.port}${path}`, {
          method,
        })
        assert.equal(response.status, 200)
        const responseText = new TextDecoder().decode(await new Response(response.body).arrayBuffer())
        assert.equal(response.headers.get('Content-Type'), 'application/json')
        const receivedData = JSON.parse(responseText)
        assert.deepEqual(receivedData, sendData)
      })
    })

    methods().forEach((method) => {
      test(`${method} controller should parse query params`, async () => {
        const path = `/${method}-controller-parse-query`
        const query: { [ket: string]: string } = {
          param1: 'value',
          param2: 'many words',
        }

        @httpController({ path })
        class MyController {
          async [method](req: HttpRequest, res: HttpResponse) {
            assert.deepEqual(req.query, query)
            return res.empty()
          }
        }

        new Server(
          {
            controllers: [MyController],
          },
          variant.router,
        )
        const url = new URL(`http://localhost:${variant.port}${path}`)
        Object.keys(query).forEach((key) => {
          url.searchParams.set(key, query[key])
        })

        await fetch(url, {
          method,
        })
      })
    })

    after(() => {
      variant.httpServer.close()
      variant.httpServer.closeAllConnections()
    })
  })
})
