import { IncomingMessage } from "http";

export class HttpRequest extends IncomingMessage {

  

  allData(): object {
    return Object.assign(
      {},
      this.body,
      this.query,
      this.params,
    )
  }

}