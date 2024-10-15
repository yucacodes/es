import { IsNotEmpty } from 'class-validator'
import assert from 'node:assert'
import { describe, test } from 'node:test'
import { Auth, AuthInfo } from './authorization'
import { BadRequest, Unauthorized } from './errors'
import { useCase } from './use-case'

class TestAuth extends Auth {
  constructor(public authInfo: AuthInfo) {
    super()
  }

  set(): void {}
  get(): AuthInfo {
    return this.authInfo
  }
}

describe(`@${useCase.name}`, () => {
  test('have disable validations by default', async () => {
    @useCase()
    class MyUseCase {
      async perform() {}
    }

    const myUseCase = new MyUseCase()
    await assert.doesNotReject(() => myUseCase.perform())
  })

  test('performs when request is OK', async () => {
    class MyRequest {
      @IsNotEmpty()
      param = ''
    }

    @useCase({
      requestValidation: MyRequest,
    })
    class MyUseCase {
      async perform(req: MyRequest) {
        return req.param
      }
    }

    const myUseCase = new MyUseCase()
    const result = await myUseCase.perform({ param: 'value' })
    assert.strictEqual(result, 'value')
  })

  test('throws when request is bad', async () => {
    class MyRequest {
      @IsNotEmpty()
      param = ''
    }

    @useCase({
      requestValidation: MyRequest,
    })
    class MyUseCase {
      async perform(req: MyRequest) {
        return req.param
      }
    }

    const myUseCase = new MyUseCase()

    await assert.rejects(
      () => myUseCase.perform({ param: '' }),
      (err: any) => {
        assert.strictEqual(err.constructor, BadRequest)
        return true
      },
    )
  })

  test('performs when scope and role matches', async () => {
    @useCase({
      authorizationScope: () => 'test',
      authorizedRoles: ['allowed-role'],
    })
    class MyUseCase {
      auth: Auth = new TestAuth({
        userId: 'id',
        roles: [{ scope: 'test', role: 'allowed-role' }],
      })
      async perform() {}
    }

    const myUseCase = new MyUseCase()

    await assert.doesNotReject(() => myUseCase.perform())
  })

  test('performs when scope match and role is in allowed roles', async () => {
    @useCase({
      authorizationScope: () => 'test',
      authorizedRoles: ['allowed-role-1', 'allowed-role-2', 'allowed-role-3'],
    })
    class MyUseCase {
      auth: Auth = new TestAuth({
        userId: 'id',
        roles: [{ scope: 'test', role: 'allowed-role-2' }],
      })
      async perform() {}
    }

    const myUseCase = new MyUseCase()

    await assert.doesNotReject(() => myUseCase.perform())
  })

  test('throws when scope match but role does not', async () => {
    @useCase({
      authorizationScope: () => 'test',
      authorizedRoles: ['allowed-role'],
    })
    class MyUseCase {
      auth: Auth = new TestAuth({
        userId: 'id',
        roles: [{ scope: 'test', role: 'another-role' }],
      })
      async perform() {}
    }

    const myUseCase = new MyUseCase()

    await assert.rejects(
      () => myUseCase.perform(),
      (err: any) => {
        assert.strictEqual(err.constructor, Unauthorized)
        return true
      },
    )
  })

  test('throws when scope match but role is not in allowed roles', async () => {
    @useCase({
      authorizationScope: () => 'test',
      authorizedRoles: ['allowed-role-1', 'allowed-role-2'],
    })
    class MyUseCase {
      auth: Auth = new TestAuth({
        userId: 'id',
        roles: [{ scope: 'test', role: 'another-role' }],
      })
      async perform() {}
    }

    const myUseCase = new MyUseCase()

    await assert.rejects(
      () => myUseCase.perform(),
      (err: any) => {
        assert.strictEqual(err.constructor, Unauthorized)
        return true
      },
    )
  })

  test('throws when scope not match', async () => {
    @useCase({
      authorizationScope: () => 'test',
      authorizedRoles: ['allowed-role'],
    })
    class MyUseCase {
      auth: Auth = new TestAuth({
        userId: 'id',
        roles: [{ scope: 'another-scope', role: 'allowed-role' }],
      })
      async perform() {}
    }

    const myUseCase = new MyUseCase()

    await assert.rejects(
      () => myUseCase.perform(),
      (err: any) => {
        assert.strictEqual(err.constructor, Unauthorized)
        return true
      },
    )
  })
})
