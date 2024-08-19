import assert from 'node:assert'
import { describe, test } from 'node:test'
import { autoMapper, AutoMapper } from './auto-mapper'
import { DateToISOStringMapper, DateToMillisTimestampMapper } from './mappers'

describe(`${AutoMapper.name}`, () => {
  test('map string to string', () => {
    const mapper = new AutoMapper()
    const value = 'any-string'

    const valueMap = mapper.map(value)

    assert.strictEqual(valueMap, value)
  })

  test('map number to number', () => {
    const mapper = new AutoMapper()
    const value = 1982

    const valueMap = mapper.map(value)

    assert.strictEqual(valueMap, value)
  })

  test('map bigint to string', () => {
    const mapper = new AutoMapper()
    const value = BigInt(
      '99999999999999999999999999999999999999999999999999999',
    )

    const valueMap = mapper.map(value)
    assert.strictEqual(
      valueMap,
      '99999999999999999999999999999999999999999999999999999',
    )
  })

  test('map bool to bool', () => {
    const mapper = new AutoMapper()

    assert.strictEqual(mapper.map(true), true)
    assert.strictEqual(mapper.map(false), false)
  })

  test('map null to null', () => {
    const mapper = new AutoMapper()
    const value = null

    const valueMap = mapper.map(value)

    assert.strictEqual(valueMap, value)
  })

  test('map undefined to undefined', () => {
    const mapper = new AutoMapper()
    const value = undefined

    const valueMap = mapper.map(value)

    assert.strictEqual(valueMap, value)
  })

  test('map plain object', () => {
    const mapper = new AutoMapper()
    const value = {
      foo: 'foo',
      bar: 'bar',
    }

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })

  test('map nested object', () => {
    const mapper = new AutoMapper()
    const value = {
      foo: 'foo',
      lv1: {
        foo: 78,
        lv2: {
          bar: 'bar',
        },
      },
    }

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })

  test('map plain array', () => {
    const mapper = new AutoMapper()
    const value = [1, 2, 'foo']

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })

  test('map nested array', () => {
    const mapper = new AutoMapper()
    const value = [1, 2, 'foo', [3, 4]]

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })
})

test('fails when map unknown model', () => {
  const mapper = new AutoMapper()
  const value = new Date()

  assert.throws(() => mapper.map(value), Error)
})

describe(`@${autoMapper.name}`, () => {
  test('extends known models mappers', () => {
    @autoMapper([DateToISOStringMapper])
    class Mapper extends AutoMapper {}
    const mapper = new Mapper()

    assert.doesNotThrow(() => mapper.map(new Date()))
  })

  test('extends known models for diferent auto mappers', () => {
    @autoMapper([DateToISOStringMapper])
    class Mapper1 extends AutoMapper {}
    const mapper1 = new Mapper1()

    assert.equal(typeof mapper1.map(new Date()), 'string')

    @autoMapper([DateToMillisTimestampMapper])
    class Mapper2 extends AutoMapper {}
    const mapper2 = new Mapper2()

    assert.equal(typeof mapper2.map(new Date()), 'number')
  })

  test('not modify previous mappers config', () => {
    @autoMapper([DateToISOStringMapper])
    class Mapper1 extends AutoMapper {}

    @autoMapper([DateToMillisTimestampMapper])
    class Mapper2 extends AutoMapper {}

    const mapper1 = new Mapper1()
    const mapper2 = new Mapper2()

    assert.equal(typeof mapper1.map(new Date()), 'string')
    assert.equal(typeof mapper2.map(new Date()), 'number')
  })
})
