export interface AmountOfTime {
  millis?: number
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
  weeks?: number
  months?: number
  years?: number
}

export abstract class Time {
  abstract now(): Date

  after(amountOfTime: AmountOfTime) {
    return this.add(this.now(), amountOfTime)
  }

  back(amountOfTime: AmountOfTime) {
    return this.add(this.now(), this.inverse(amountOfTime))
  }

  inverse(amountOfTime: AmountOfTime): AmountOfTime {
    const out = Object.assign({}, amountOfTime)
    for (const key in out) {
      (out as any)[key] = -(out as any)[key]
    }
    return out
  }

  add(date: Date, amountOfTime: AmountOfTime) {
    const newDate = new Date(date)
    const { millis, seconds, minutes, hours, days, weeks, months, years } =
      amountOfTime
    if (millis) {
      newDate.setMilliseconds(newDate.getMilliseconds() + millis)
    }
    if (seconds) {
      newDate.setSeconds(newDate.getSeconds() + seconds)
    }
    if (minutes) {
      newDate.setMinutes(newDate.getMinutes() + minutes)
    }
    if (hours) {
      newDate.setHours(newDate.getHours() + hours)
    }
    if (days) {
      newDate.setDate(newDate.getDate() + days)
    }
    if (weeks) {
      newDate.setDate(newDate.getDate() + weeks * 7)
    }
    if (months) {
      newDate.setMonth(newDate.getMonth() + months)
    }
    if (years) {
      newDate.setFullYear(newDate.getFullYear() + years)
    }
    return newDate
  }
}
