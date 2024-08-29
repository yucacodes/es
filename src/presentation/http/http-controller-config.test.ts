import assert from 'node:assert'
import test, { describe } from 'node:test'
import {
  HttpControllerConfigForUseCase,
  isHttpControllerClassConfig,
  isHttpControllerForUseCaseConfig,
  listHttpMethodsForControllerClass,
} from './http-controller-config'

describe('Http controller config', () => {
  test(`determine when config is for useCase`, () => {
    class MyUseCase {
      async perform() {}
    }

    const config: HttpControllerConfigForUseCase = {
      method: 'GET',
      path: 'any/path',
      useCase: MyUseCase,
    }

    assert.equal(isHttpControllerForUseCaseConfig(config), true)
  })

  test(`determine when config is not for useCase`, () => {
    const config1 = {
      method: 'get',
      path: 'any/path',
    }

    class MyUseCase {
      async perform() {}
    }

    const config2 = {
      useCase: MyUseCase,
    }

    assert.equal(isHttpControllerForUseCaseConfig(config1), false)
    assert.equal(isHttpControllerForUseCaseConfig(config2), false)
  })

  test(`determine when config is controller class`, () => {
    class MyController {
      async GET() {}
    }

    assert.equal(isHttpControllerClassConfig(MyController), true)
  })

  test(`determine when config is not controller class`, () => {
    class MyController {
      async any() {}
    }

    assert.equal(isHttpControllerClassConfig(MyController), false)
  })

  test(`list Http Methods for controller class`, () => {
    class MyController {
      async any() {}
      async DELETE() {}
      async other() {}
      async GET() {}
    }

    const list = listHttpMethodsForControllerClass(MyController)

    assert(list.includes('DELETE'))
    assert(list.includes('GET'))
    assert(list.length === 2)
  })
})
