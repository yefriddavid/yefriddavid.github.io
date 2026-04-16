import { describe, it, expect } from 'vitest'
import reducer from '../usersReducer'
import * as actions from '../../actions/usersActions'
import { makeUser } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false, sessions: {} }

describe('usersReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('beginRequestFetch sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores data and clears fetching', () => {
      const users = [makeUser()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(users))
      expect(s.data).toEqual(users)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError, stores error, clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('timeout')
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ─────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('beginRequestCreate sets fetching', () => {
      expect(reducer(initial, actions.beginRequestCreate()).fetching).toBe(true)
    })

    it('successRequestCreate appends user and sorts alphabetically by name', () => {
      const existing = makeUser({ username: 'pramirez', name: 'Pedro Ramirez' })
      const incoming = makeUser({ username: 'agarcia', name: 'Ana Garcia' })
      const s = reducer({ ...initial, data: [existing] }, actions.successRequestCreate(incoming))
      expect(s.data[0].name).toBe('Ana Garcia')
      expect(s.data[1].name).toBe('Pedro Ramirez')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data array when null', () => {
      const user = makeUser()
      const s = reducer(initial, actions.successRequestCreate(user))
      expect(s.data).toEqual([user])
    })

    it('errorRequestCreate sets isError, stores error, clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestCreate('forbidden'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('forbidden')
      expect(s.fetching).toBe(false)
    })
  })

  // ── Update ─────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('successRequestUpdate merges fields by username and re-sorts', () => {
      const u1 = makeUser({ username: 'agarcia', name: 'Ana Garcia', role: 'manager' })
      const u2 = makeUser({ username: 'pramirez', name: 'Pedro Ramirez', role: 'conductor' })
      // Rename u2 to "Beatriz Lopez" — should now sort before Pedro
      const s = reducer(
        { ...initial, data: [u1, u2] },
        actions.successRequestUpdate({
          username: 'pramirez',
          name: 'Beatriz Lopez',
          role: 'manager',
        }),
      )
      expect(s.data[0].name).toBe('Ana Garcia')
      expect(s.data[1].name).toBe('Beatriz Lopez')
      expect(s.data[1].role).toBe('manager')
      // Unchanged fields preserved
      expect(s.data[1].email).toBe(u2.email)
    })

    it('successRequestUpdate is a no-op when data is null', () => {
      const s = reducer(initial, actions.successRequestUpdate({ username: 'jperez', name: 'X' }))
      expect(s.data).toBeNull()
    })

    it('errorRequestUpdate sets isError and stores error', () => {
      const s = reducer(initial, actions.errorRequestUpdate('conflict'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('conflict')
    })
  })

  // ── Delete ─────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes user by username', () => {
      const u1 = makeUser({ username: 'user1' })
      const u2 = makeUser({ username: 'user2' })
      const s = reducer(
        { ...initial, data: [u1, u2] },
        actions.successRequestDelete({ username: 'user1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].username).toBe('user2')
    })

    it('successRequestDelete is a no-op when data is null', () => {
      const s = reducer(initial, actions.successRequestDelete({ username: 'user1' }))
      expect(s.data).toBeNull()
    })

    it('errorRequestDelete sets isError and stores error', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('not found')
    })
  })
})
