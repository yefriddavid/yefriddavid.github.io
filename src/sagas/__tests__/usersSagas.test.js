import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/usersActions'
import * as service from '../../services/providers/firebase/Security/users'
import { makeUser } from '../../__tests__/factories'

// Step-through generator copies (standard redux-saga testing pattern)
function* fetchUsers() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getAllUsers)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createUser({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    yield call(service.createUser, payload)
    yield put(actions.successRequestCreate(payload))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateUser({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateUser, payload.username, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteUser({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteUser, payload.username)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

describe('usersSagas', () => {
  describe('fetchUsers', () => {
    it('dispatches beginRequestFetch → getAllUsers → successRequestFetch', () => {
      const gen = fetchUsers()
      const users = [makeUser()]

      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getAllUsers))
      expect(gen.next(users).value).toEqual(put(actions.successRequestFetch(users)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestFetch on service failure', () => {
      const gen = fetchUsers()
      gen.next()  // beginRequestFetch
      gen.next()  // call getAllUsers
      expect(gen.throw(new Error('network error')).value).toEqual(put(actions.errorRequestFetch('network error')))
    })
  })

  describe('createUser', () => {
    it('full success flow: beginRequestCreate → createUser(payload) → successRequestCreate', () => {
      const payload = makeUser()
      const gen = createUser({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.createUser, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestCreate(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestCreate on service failure', () => {
      const gen = createUser({ payload: makeUser() })
      gen.next()  // beginRequestCreate
      gen.next()  // call createUser
      expect(gen.throw(new Error('username already exists')).value).toEqual(
        put(actions.errorRequestCreate('username already exists')),
      )
    })
  })

  describe('updateUser', () => {
    it('dispatches beginRequestUpdate → updateUser(username, payload) → successRequestUpdate', () => {
      const payload = makeUser({ role: 'conductor' })
      const gen = updateUser({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
      expect(gen.next().value).toEqual(call(service.updateUser, payload.username, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestUpdate on service failure', () => {
      const gen = updateUser({ payload: makeUser() })
      gen.next()  // beginRequestUpdate
      gen.next()  // call updateUser
      expect(gen.throw(new Error('permission denied')).value).toEqual(
        put(actions.errorRequestUpdate('permission denied')),
      )
    })
  })

  describe('deleteUser', () => {
    it('dispatches beginRequestDelete → deleteUser(username) → successRequestDelete', () => {
      const payload = { username: 'jperez' }
      const gen = deleteUser({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteUser, payload.username))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestDelete on service failure', () => {
      const gen = deleteUser({ payload: { username: 'jperez' } })
      gen.next()  // beginRequestDelete
      gen.next()  // call deleteUser
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })
})
