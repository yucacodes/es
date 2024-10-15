import assert from 'node:assert'
import { describe, test } from 'node:test'
import { DefaultDtoMapper } from './default-dto-mapper'

const mapper = new DefaultDtoMapper()

describe(`${DefaultDtoMapper.name}`, () => {
  test('map Date to ISO string', () => {
    const dateIsoStr = '2025-01-10T20:30:10.350Z'
    const date = new Date(dateIsoStr)

    const dateMap = mapper.map(date)

    assert.strictEqual(dateMap, dateIsoStr)
  })
})
