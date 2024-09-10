import express from 'express'
import fmw from 'find-my-way'
import assert from 'node:assert'
import test, { describe } from 'node:test'
import { ExpressRouter } from '../presentation/http-express/ExpressRouterAdapter'
import { FindMyWayRouter } from '../presentation/http-find-my-way/FindMyWayRouterAdapter'
import { Server } from './server'

function routers() {
  return [
    new ExpressRouter(express.Router()),
    new FindMyWayRouter(fmw()),
  ] as const
}

describe(`${Server.name} with express`, () => {
  routers().forEach((router) => {
    test(`instanciate with ${router.constructor.name}`, () => {
      assert.doesNotThrow(() => new Server({}, router))
    })
  })
})
