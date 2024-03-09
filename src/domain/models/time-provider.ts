export abstract class TimeProvider {
  abstract now(): Date
  minutesLater(minutes: number): Date {
    const date = this.now()
    date.setMinutes(date.getMinutes() + minutes)
    return date
  }
}
