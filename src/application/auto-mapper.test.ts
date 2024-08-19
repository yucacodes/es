import assert from 'node:assert'
import { describe, test } from 'node:test'
import { AutoMapper } from './auto-mapper'

const mapper = new AutoMapper()

describe(`${AutoMapper.name}`, () => {
  test('Map string to string', () => {
    const value = 'any-string'

    const valueMap = mapper.map(value)

    assert.equal(valueMap, value)
  })

  test('Map number to number', () => {
    const value = 1982

    const valueMap = mapper.map(value)

    assert.equal(valueMap, value)
  })

  test('Map bool to bool', () => {
    assert.equal(mapper.map(true), true)
    assert.equal(mapper.map(false), false)
  })

  test('Map null to null', () => {
    const value = null

    const valueMap = mapper.map(value)

    assert.equal(valueMap, value)
  })

  test('Map undefined to undefined', () => {
    const value = null

    const valueMap = mapper.map(value)

    assert.equal(valueMap, value)
  })

  test('Map plain object', () => {
    const value = {
      foo: 'foo',
      bar: 'bar',
    }

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })

  test('Map nested object', () => {
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

  test('Map plain array', () => {
    const value = [1, 2, "foo"]

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })

  test('Map nested array', () => {
    const value = [1, 2, "foo", [3, 4]]

    const valueMap = mapper.map(value)

    assert.deepEqual(valueMap, value)
  })
})

test('Fails when map unknown model', () => {
  const value = new Date()

  assert.throws(() => mapper.map(value), Error)
})