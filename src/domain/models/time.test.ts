import assert from 'node:assert'
import test, { describe } from 'node:test'
import { Time } from './time'

class TimeTest extends Time {
  private fixedTime: string

  constructor(fixedTime?: string) {
    super()
    this.fixedTime = fixedTime ? fixedTime : new Date().toISOString()
  }

  now(): Date {
    return new Date(this.fixedTime)
  }
}

describe(`${Time.name}`, () => {
  test('invert amount of time', () => {
    const time = new TimeTest()

    const result = time.inverse({ years: 1, months: -5 })

    assert.deepEqual(result, { years: -1, months: 5 })
  })

  test('add millis', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), {
      millis: 100,
    })

    assert.equal(result.toISOString(), '2024-08-19T14:45:12.959Z')
  })

  test('add seconds', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), {
      seconds: 100,
    })

    assert.equal(result.toISOString(), '2024-08-19T14:46:52.859Z')
  })

  test('add minutes', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), {
      minutes: 100,
    })

    assert.equal(result.toISOString(), '2024-08-19T16:25:12.859Z')
  })

  test('add hours', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), {
      hours: 100,
    })

    assert.equal(result.toISOString(), '2024-08-23T18:45:12.859Z')
  })

  test('add days', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), { days: 5 })

    assert.equal(result.toISOString(), '2024-08-24T14:45:12.859Z')
  })

  test('add weeks', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), { weeks: 2 })

    assert.equal(result.toISOString(), '2024-09-02T14:45:12.859Z')
  })

  test('add month', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), {
      months: 10,
    })

    assert.equal(result.toISOString(), '2025-06-19T14:45:12.859Z')
  })

  test('add years', () => {
    const time = new TimeTest()

    const result = time.add(new Date('2024-08-19T14:45:12.859Z'), { years: 10 })

    assert.equal(result.toISOString(), '2034-08-19T14:45:12.859Z')
  })

  test('after amount of time', () => {
    const time = new TimeTest('2024-08-19T14:45:12.859Z')

    const result = time.after({
      millis: 100,
      seconds: 30,
      minutes: 5,
      hours: 15,
      days: 2,
      weeks: 1,
      months: 8,
      years: 10,
    })

    assert.equal(result.toISOString(), '2035-04-29T05:50:42.959Z')
  })

  test('back amount of time', () => {
    const time = new TimeTest('2035-04-29T05:50:42.959Z')

    const result = time.back({
      millis: 100,
      seconds: 30,
      minutes: 5,
      hours: 15,
      days: 2,
      weeks: 1,
      months: 8,
      years: 10,
    })

    assert.equal(result.toISOString(), '2024-08-19T14:45:12.859Z')
  })
})
