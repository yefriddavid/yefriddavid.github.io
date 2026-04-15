import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/usersActions'
import * as service from '../../services/providers/firebase/Security/users'
import { fetchUsers, createUser, updateUser, deleteUser } from '../usersSagas'
import { makeUser } from '../../__tests__/factories'

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
