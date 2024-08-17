export interface Notification<E extends Object> {
  event: E
  channel: string
  includeOrigin?: boolean
}

export interface Subscription {
  channel: string
}

export abstract class EventsBus {
  abstract notify<E extends Object>(event: Notification<E>): void
  abstract subscribe(subscription: Subscription): void
  abstract unsubscribe(subscription: Subscription): void
}
