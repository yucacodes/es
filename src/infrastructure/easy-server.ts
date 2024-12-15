import { Server } from './server'
import express from 'express'
import http from 'http'
import { ServerConfig } from './server-config'
import { ExpressRouter } from '../presentation'

export class EasyServer {
  expressRouter = express()
  httpServer = http.createServer(this.expressRouter)
  router = new ExpressRouter(this.expressRouter)
  server: Server

  constructor(config: ServerConfig) {
    this.server = new Server(config, this.router)
  }

  listen(port: number) {
    this.httpServer.listen(port)
  }

  close() {
    this.httpServer.close()
    this.httpServer.closeAllConnections()
  }
}
